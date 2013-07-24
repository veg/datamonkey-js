/*
  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//Data Type
define("Codon",0);
define("Nucleotide (DNA/RNA)",1);
define("Protein",2);

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


var meme = {
  full_name             : "Mixed Effects Model of Episodic Diversifying Selection",
  help                  : "http://hyphy.org/w/index.php/API:MEME",
  id                    : 12,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
  prime_property_choice : 0
};

var bsrel = {
  full_name             : "Branch-site REL test for Episodic Diversifying Selection",
  help                  : "http://hyphy.org/w/index.php/API:Branch-site_REL",
  id                    : 9,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
  pvalue                : 0.1,
  prime_property_choice : 0
};

var toggle = {
  full_name             : "TOGGLE",
  help                  : "http://hyphy.org/w/index.php/API:Toggle",
  id                    : 69,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
  prime_property_choice : 0
};

var fubar = {
  full_name             : "Fast Unconstrained Bayesian AppRoximation",
  help                  : "http://hyphy.org/w/index.php/API:Fubar",
  id                    : 13,
  root                  : "SRC1",
  namedmodels           : "",
  modelstring           : "010010",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
  prime_property_choice : 0
};

var asr = {
  full_name             : "Ancestral State Reconstruction",
  help                  : "http://hyphy.org/w/index.php/API:ASR",
  id                    : 22,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  pvalue                : 0.1,
  rateoption            : 1,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
  prime_property_choice : 0
};

var gabranch = {
  full_name             : "GA-Branch",
  help                  : "http://hyphy.org/w/index.php/API:GABranch",
  id                    : 5,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
};

var cms = {
  full_name             : "Codon Model Selection",
  help                  : "",
  id                    : 55,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2,
};

var modelselection = {
  full_name : "Model",
  help      : "http://hyphy.org/w/index.php/API:Model_Selection",
  id : 10,
};

var gard = {
  full_name             : "GARD",
  help                  : "http://hyphy.org/w/index.php/API:GARD",
  id                    : 21,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 1,
  rateclasses           : 2,
  rateoption2           : 1,
  rateClasses2          : 2
};

var evf = {
  full_name             : "Evolutionary Fingerprinting",
  help                  : "http://hyphy.org/w/index.php/API:EVF",
  id                    : 42,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var sbp = {
  full_name             : "Single Breakpoint Recombination",
  help                  : "http://hyphy.org/w/index.php/API:SBP",
  id                    : 20,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 1,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var parris = {
  full_name             : "PARRIS",
  help                  : "http://hyphy.org/w/index.php/API:PARRIS",
  id                    : 4,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var slac = {
  full_name             : "SLAC",
  help                  : "http://hyphy.org/w/index.php/API:SLAC",
  id                    : 0,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.1,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var bgm = {
  full_name             : "BGM",
  help                  : "http://hyphy.org/w/index.php/API:BGM",
  id                    : 6,
  treemode              : 0,
  root                  : "SRC1",
  modelstring           : "010010",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  pvalue                : 0.5,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var fel = {
  full_name             : "FEL",
  help                  : "http://hyphy.org/w/index.php/API:FEL",
  id                    : 1,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var ifel = {
  full_name             : "IFEL",
  help                  : "http://hyphy.org/w/index.php/API:IFEL",
  id                    : 2,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var prime = {
  full_name             : "PRoperty Informed Models of Evolution",
  help                  : "http://hyphy.org/w/index.php/API:PRIME",
  id                    : 71,
  root                  : "SRC1",
  namedmodels           : "",
  roptions              : 4,
  dnds                  : 1.0,
  ambchoice             : 0,
  prime_property_choice : 0,
  rateoption            : 0,
  rateclasses           : 2,
  rateoption2           : 1,
  rateclasses2          : 2
};

var scueal = {
  full_name             : "SCUEAL",
  help                  : "http://hyphy.org/w/index.php/API:SCUEAL",
  id                    : 50,
};

define("asr"                   , asr);
define("bsrel"                 , bsrel);
define("meme"                  , meme);
define("cms"                   , cms);
define("fel"                   , fel);
define("ifel"                  , ifel);
define("fubar"                 , fubar);
define("modelselection"        , modelselection);
define("gard"                  , gard);
define("gabranch"              , gabranch);
define("evf"                   , evf);
define("sbp"                   , sbp);
define("parris"                , parris);
define("slac"                  , slac);
define("bgm"                   , bgm);
define("prime"                 , prime);
define("scueal"                , scueal);
define("toggle"                , toggle);
//define("uds",uds)

var types = {
  "asr"            : asr,
  "bsrel"          : bsrel,
  "meme"           : meme,
  "cms"            : cms,
  "fel"            : fel,
  "ifel"           : ifel,
  "fubar"          : fubar,
  "modelselection" : modelselection,
  "gard"           : gard,
  "gabranch"       : gabranch,
  "evf"            : evf,
  "sbp"            : sbp,
  "parris"         : parris,
  "slac"           : slac,
  "bgm"            : bgm,
  "prime"          : prime,
  "scueal"         : scueal,
  "toggle"         : toggle
};

define("types", types);

//Trees
var treemode = {
  0 :"Neighbor Joining Tree",
  1: "User Tree(s)"
};

define("treemode", treemode);

//Genetic Code
var genetic_code = {
 0 : "Universal Code",
 1 : "Vertebrate mitochondrial DNA code",
 2 : "Yeast mitochondrial DNA code",
 3 : "Mold, Protozoan and Coelenterate mt; Mycloplasma/Spiroplasma",
 4 : "Invertebrate mitochondrial DNA code",
 5 : "Ciliate, Dasycladacean and Hexamita Nuclear code",
 6 : "Echinoderm mitochondrial DNA code",
 7 : "Euplotid Nuclear code",
 8 : "Alternative Yeast Nuclear code",
 9 : "Ascidian mitochondrial DNA code",
 10 : "Flatworm mitochondrial DNA code",
 11 : "Blepharisma Nuclear code"
}

define("genetic_code", genetic_code)

