function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

const cluster_ip_urls_array = [
    'http://silverback.temple.edu:7013',
    'http://silverback.temple.edu:7014',
    'http://silverback.temple.edu:7015',
    'http://silverback.temple.edu:7016'
  ];


define('host','datamonkey-dev');
define('port', 4002);
define('database', 'mongodb://localhost/datamonkey-dev');
define('log_level', 'warn');
define('cluster_ip', cluster_ip_urls_array);
define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
define('hyphy', __dirname + '/node_modules/hyphy/HYPHYMP');
<<<<<<< HEAD
define('cluster_ip_urls_array', cluster_ip_urls_array);
define('default_url', cluster_ip_urls_array[0]);
=======
>>>>>>> 7d7d4a9cb558ed5c0de3b4b611556093998c2f2d
