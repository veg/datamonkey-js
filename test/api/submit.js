const request = require("request");
(path = require("path")),
  (setup = require("../../config/setup")),
  (assert = require("assert"));

describe("api validation", () => {
  const url = "http://max.datamonkey.org/api/v1/submit";

  it("gets url contents", function (done) {
    this.timeout(3000);

    let fastaLoc = "http://datamonkey.org/assets/Flu.fasta",
      gencodeid = 0,
      datatype = 0,
      mail = "sweaver@temple.edu";

    request.post(
      url,
      {
        json: {
          fastaLoc: fastaLoc,
          gencodeid: gencodeid,
          datatype: datatype,
          mail: mail,
        },
      },
      (error, res, body) => {
        if (error) {
          console.error(error);
          return;
        }

        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
        done();
      }
    );
  });
});
