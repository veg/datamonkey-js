#  Datamonkey - An API for comparative analysis of sequence alignments using
#  state-of-the-art statistical models.
#
#  Copyright (C) 2013
#  Sergei L Kosakovsky Pond (spond@ucsd.edu)
#  Steven Weaver (sweaver@ucsd.edu)
#
#  Permission is hereby granted, free of charge, to any person obtaining a
#  copy of this software and associated documentation files (the
#  "Software"), to deal in the Software without restriction, including
#  without limitation the rights to use, copy, modify, merge, publish,
#  distribute, sublicense, and/or sell copies of the Software, and to
#  permit persons to whom the Software is furnished to do so, subject to
#  the following conditions:
#
#  The above copyright notice and this permission notice shall be included
#  in all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
#  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
#  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
#  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
#  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
#  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
#  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from msa import UploadFile
from analysis import Analysis

types = ["asr", "bgm", "cms", "dm", "evf", "fel", "fubar", "gabranch",
         "gard", "ifel", "meme", "modelselection", "parris", "prime",
         "sbp", "scueal", "slac"]

mail = 'sweaver@ucsd.edu'
fn   = '/home/sweaver/datamonkey-js/wrappers/res/HIV_gp120.nex'

msa = UploadFile(fn, 0, 0, mail)

#Neighbor Joining
asr_params = {
    "treemode"    : 0,
    "treeroot"    : "SRC1",
    "namedmodel"  : "",
    "modelstring" : "010010",
    "rateoption"  : 0,
    "rateclasses" : 2,
    "sendmail"    : True
}

bgm_params = {
    "namedmodel"  : "",
    "modelstring" : "010010",
    "dnds"        : 1.0,
    "ambchoice"   : 0,
    "pvalue"      : 0.1,
    "sendmail"    : True
}

cms_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "sendmail"    : True
}

evf_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "sendmail"    : True
}

fel_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "pvalue"      : 0.1,
    "sendmail"    : True
}

fubar_params = {
    "treemode" : 0,
    "pvalue"   : 0.1,
    "sendmail" : True
}

gabranch_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "sendmail"    : True
}

gard_params = {
    "treemode"    : 0,
    "namedmodel"  : "",
    "modelstring" : "010010",
    "rateoption"  : 2,
    "rateclasses" : 2,
    "sendmail"    : True
}

ifel_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "pvalue"      : 0.1,
    "sendmail"    : True
}

meme_params = {
    "treemode"    : 0,
    "modelstring" : "010010",
    "pvalue"      : 0.1,
    "sendmail"    : True
}

parris_params = {
    "treemode"    : 0,
    "namedmodel"  : "",
    "modelstring" : "010010",
    "pvalue"      : 0.1,
    "sendmail"    : True
}

parris_params = {
    "treemode"    : 0,
    "namedmodel"  : "",
    "modelstring" : "010010",
    "pvalue"      : 0.1,
    "sendmail"    : True
}

prime_params = {
    "treemode"              : 0,
    "prime_property_choice" : 0,
    "sendmail"              : True
}

sbp_params = {
    "namedmodel"  : "",
    "modelstring" : "010010",
    "rateoption"  : 2,
    "rateclasses" : 2,
    "sendmail"    : True
}

slac_params = {
    "namedmodel"  : "",
    "modelstring" : "010010",
    "dnds"        : 1.0,
    "ambchoice"   : 0,
    "pvalue"      : 0,
    "sendmail"    : True
}

#asr_analysis = Analysis(msa.id, "asr", asr_params)
#print asr_analysis.response

#bgm_analysis = Analysis(msa.id, "bgm", bgm_params)
#print bgm_analysis.response

#cms_analysis = Analysis(msa.id, "cms", cms_params)
#print cms_analysis.response

#evf_analysis = Analysis(msa.id, "evf", evf_params)
#print evf_analysis.response

#fel_analysis = Analysis(msa.id, "fel", fel_params)
#print fel_analysis.response

#fubar_analysis = Analysis(msa.id, "fubar", fubar_params)
#print fubar_analysis.response

#gabranch_analysis = Analysis(msa.id, "gabranch", gabranch_params)
#print gabranch_analysis.response

#ifel_analysis = Analysis(msa.id, "ifel", ifel_params)
#print ifel_analysis.response

meme_analysis = Analysis(msa.id, "meme", meme_params)
print meme_analysis.response

#modelselection_analysis = Analysis(msa.id, "modelselection")
#print modelselection_analysis.response

#parris_analysis = Analysis(msa.id, "parris", parris_params)
#print parris_analysis.response

#prime_analysis = Analysis(msa.id, "prime", prime_params)
#print prime_analysis.response

#sbp_analysis = Analysis(msa.id, "sbp", sbp_params)
#print sbp_analysis.response

#slac_analysis = Analysis(msa.id, "slac", slac_params)
#print slac_analysis.response

