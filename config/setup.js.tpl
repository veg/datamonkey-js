
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//// PRODUCTION
//define('host','datamonkey-dev');
//define('port', 4000);
//define('socket_port', 4001);
//define('database', 'mongodb://localhost/datamonkey-dev-steven');
//define('logger', 'dev');
//define('cluster_ip','silverback.ucsd.edu:7010');

//// QA
//define('host','datamonkey-dev');
//define('port', 4000);
//define('socket_port', 4001);
//define('database', 'mongodb://localhost/datamonkey-dev-steven');
//define('logger', 'dev');
//define('cluster_ip','silverback.ucsd.edu:7010');

// DEV
define('host','datamonkey-dev');
define('port', 4000);
define('socket_port', 4001);
define('database', 'mongodb://localhost/datamonkey-dev');
define('logger', 'dev');
define('cluster_ip','http://silverback.ucsd.edu:7000');
define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
define('hyphy', __dirname + '/node_modules/hyphy/HYPHYMP');

