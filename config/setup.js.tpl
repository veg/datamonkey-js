function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

const cluster_ip_urls_array = [ 
    'http://silverback.temple.edu:7015',
    'http://silverback.temple.edu:7016'
  ];

const database_path = "mongodb://localhost/";
const database_name = "datamonkey-dev";

define('host','new-silverback');
define('port', 3975);
define('redisHost', 'localhost');
define('redisPort', '6379');
define('database', database_path + database_name);
define('database_name', database_name);
define('log_level', 'warn');
define('cluster_ip', cluster_ip_urls_array);
define('flea_ip_address', 'http://silverback.temple.edu:7004');
define('fasta_validator', '/home/sweaver/TN93/validate_fasta');
define('hyphy', __dirname + '/node_modules/hyphy/HYPHYMP');
define('cluster_ip_urls_array', cluster_ip_urls_array);
define('default_url', 'http://silverback.temple.edu:7015');
//define('warning_message', "Datamonkey is currently undergoing technical difficulties.");
define('api_request_limit', 100);
define('api_expires_in_sec', 1728000); //default 48 hours 172800
define('api_base_url', 'dev.datamonkey.org');
define('api_recapcha_pri', "6LclsawZAAAAAEVhmbt6Sgi49pKjHZxOgYlHQ1hM"); //Ensure you are using the right private key!
define('api_dev_mode', false); //True will ignore recapcha