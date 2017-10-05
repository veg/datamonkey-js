
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define('host','datamonkey-dev');
define('port', 4000);
define('database', 'mongodb://localhost/datamonkey-dev');
define('logger', 'dev');
define('cluster_ip','http://silverback.temple.edu:7000');
define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
define('hyphy', __dirname + '/node_modules/hyphy/HYPHYMP');

