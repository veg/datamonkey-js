function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//We need to split each of the following into classes

//Spool Directory
define("spooldir","/var/lib/datamonkey/www/spool/")
define("host","datamonkey-dev")

//Data Type
define("Codon",0);
define("Nucleotide (DNA/RNA)",1);
define("Protein",2);

//Genetic Code
define("Universal code",0);
define("Vertebrate mitochondrial DNA code",1);
define("Yeast mitochondrial DNA code",2);
define("Mold, Protozoan and Coelenterate mt; Mycloplasma/Spiroplasma",3);
define("Invertebrate mitochondrial DNA code",4);
define("Ciliate, Dasycladacean and Hexamita Nuclear code",5);
define("Echinoderm mitochondrial DNA code",6);
define("Euplotid Nuclear code",7);
define("Alternative Yeast Nuclear code",8);
define("Ascidian mitochondrial DNA code",9);
define("Flatworm mitochondrial DNA code",10);
define("Blepharisma Nuclear code",11);


//Methods
define("SLAC",0);
define("FEL",1);
define("IFEL",2);
define("REL",3);
define("PARRIS",4);
define("GA-Branch",5);
define("Branch-site REL",9);
define("MEME",12);
define("FUBAR",13);
define("Evolutionary Fingerprintng",42);
define("GA-Codon Model Selector",55);
define("TOGGLE Analysis",69);
define("SPIDERMONKEY/BGM",6);
define("SBP",20);
define("GARD",21);
define("ASR",22);

//Trees
define("Neighbor Joining Tree",0);
define("User Tree(s)",1);

//Model Form
define("AC",0);
define("1",1);
define("AT",2);
define("CG",3);
define("CT",4);
define("GT",5);

//Named Models
define("F81",111111);
define("HKY85",010010);
define("TrN93",010040);
define("REV",012345);

//R-Options
define("Neutral",0);
define("User Supplied",1);
define("Estimated",4);
define("Estimated with CI",3);

//ambChoice
define("Averaged",0);
define("Resolved",1);


//Site-to-site rate variation
define("None",0);
define("General Discrete",1);
define("Beta-Gamma",2);

//Status Specific
define("pollingdelay",1000);
define("queue","queueing");
define("running","running");
define("finished","finished");
define("cancelled","cancelled");

types = {
meme: "meme"
}

define("types",types)
