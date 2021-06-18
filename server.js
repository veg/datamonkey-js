const logger = require("./lib/logger");
var setup = require("./config/setup");
var error = require("./lib/error");
var queue = require("./lib/queue.js");

ROOT_PATH = __dirname;
HOST = setup.host;

// Necessary packages
var express = require("express"),
  expressValidator = require("express-validator"),
  mongoose = require("mongoose"),
  upload = require("jquery-file-upload-middleware"),
  helpers = require("./lib/helpers"),
  loadBal = require("./lib/loadBal"),
  fs = require("fs"),
  path = require("path"),
  redis = require("redis"),
  mongoose = require("mongoose"),
  bb = require("express-busboy");

// Connect to database
mongoose.connect(setup.database, { useMongoClient: true });

//Ensure that upload paths exists
mkdirErrorLogger = error.errorLogger(["EEXIST"]);

fs.mkdir(path.join(__dirname, "/uploads"), "0750", function (e) {
  if (e) {
    if (e.code != "EEXIST") {
      throw e;
    }
  }
  // need to do this in the callback to ensure uploads
  // directory exists first
  fs.mkdir(path.join(__dirname, "/uploads/hivtrace"), "0750", mkdirErrorLogger);
  fs.mkdir(path.join(__dirname, "/uploads/msa"), "0750", mkdirErrorLogger);
});

// ensure logging dir exists
fs.mkdir(path.join(__dirname, "/logs"), "0750", mkdirErrorLogger);

// START FLEA
// TODO: Move this out of main

upload.configure({
  //TODO: customize filename
  uploadDir: path.join(__dirname, "/uploads/flea/tmp"),
  uploadUrl: "/fleaupload",
});

upload.on("end", function (fileInfo, req, res) {});

// END FLEA

// Main app configuration
var app = express();
app.engine(".ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "/app/templates"));

var server = app.listen(setup.port);
var io = require("socket.io").listen(server);

//app.use(express.compress());
app.use(require("morgan")("combined", { stream: logger.stream }));
app.use(expressValidator());
app.use("/fleaupload", upload.fileHandler());
app.set("json spaces", 0);
app.enable("trust proxy");

bb.extend(app, {
  upload: true,
  path: "/tmp/express-busboy/",
});

var models_path = path.join(__dirname, "/app/models");

fs.readdirSync(models_path).forEach(function (file) {
  require(path.join(models_path, "/", file));
});

var usageStatisticsLooper = require("./lib/usageStatistics.js");
var checkJobsLooper = require("./lib/checkJobs.js");
setInterval(checkJobsLooper, 3600000);

app.use(express.static(path.join(__dirname, "/public")));
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

require("./config/routes")(app);
app.use(
  "/flea/",
  express.static(path.join(__dirname, "/public/assets/lib/flea/dist/"))
);

app.use(function (err, req, res, next) {
  res.json(500, { error: err.message });
});

//Port to listen on
logger.info("Listening on port " + setup.port + "...");

module.exports = server;

// Set up socket.io server
var jobproxy = require("./lib/hpcsocket.js");

io.sockets.on("connection", function (socket) {
  socket.emit("connected");
  socket.on("acknowledged", function (data) {
    var clientSocket = new jobproxy.ClientSocket(socket, data.id);
  });

  socket.on("fasta_parsing_progress_start", function (data) {
    var fasta_listener = redis.createClient({
      host: setup.redisHost,
      port: setup.redisPort,
    });
    fasta_listener.subscribe("fasta_parsing_progress_" + data.id);
    fasta_listener.on("message", function (channel, message) {
      socket.emit("fasta_parsing_update", message);
      if (message == "done") {
        fasta_listener.end();
      }
    });
  });

  socket.on("attribute_parsing_progress_start", function (data) {
    var attr_listener = redis.createClient({
      host: setup.redisHost,
      port: setup.redisPort,
    });
    attr_listener.subscribe("attribute_parsing_progress_" + data.id);
    attr_listener.on("message", function (channel, message) {
      socket.emit("attribute_parsing_progress", message);
      if (message == "done") {
        attr_listener.end();
      }
    });
  });
});

// Set any initial redis keys
loadBal.setInitialLoadBalanceKeys();

setInterval(queue.queueSet, 15000);
