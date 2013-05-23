#  HyPhy - Hypothesis Testing Using Phylogenies.
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


import dm
import msa

def fubar_analysis(msaid,treemode,pvalue,sendmail=False,block=False):
    # We need to tell the API the method
    # A fubar analysis requires:
    # sequence
    # treemode
    # (Model String and Named Model may be redundant)
    # modelstring
    # namedmodel
    # pvalue

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither

    #TODO: Have url friendly sequence ids

    method = "/msa/{0}/fubar".format(msaid)
    response = dm.post(method,msaid=msaid,treemode=treemode,pvalue=pvalue,sendmail=sendmail,block=block)
    return response

def get_fubar_status(msaid,fubarid):
    method = "/msa/{0}/fubar/{1}".format(msaid,fubarid)
    response = dm.get(method,params=None)
    return response

def parse_fubar_results(msaid,fubarid):
    method = "/msa/{0}/fubar/{1}/parse".format(msaid,fubarid)
    response = dm.get(method,params=None)
    return response

def get_fubar_results(msaid,fubarid):
    method = "/msa/{0}/fubar/{1}/results".format(msaid,fubarid)
    response = dm.get(method,params=None)
    return response

def mail_fubar_results(msaid,fubarid):
    method = "/msa/{0}/fubar/{1}/mail".format(msaid,fubarid)
    response = dm.get(method,params=None)
    return response

def parse_fubar_results(msaid,fubarid):
    method = "/msa/{0}/fubar/{1}/parseresults".format(msaid,fubarid)
    response = dm.get(method,params=None)
    return response


def get_all_fubar():
    method = "/msa/{0}/fubar".format(msaid)
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    mail   = 'sweaver@ucsd.edu'
    #fn    = './dnds_input/PF3D7_1470900.alignment.fasta.nostop'

    filenames = [[dirpath + f for f in filenames] for (dirpath, dirname, filenames) in os.walk(mypath)][0]

    msa = msa.create_msa(fn,0,0,mail)

    #Neighbor Joining
    treemode = 0
    pvalue = 0.9
    sendmail = True;

    fubar_collection = []
    fubar_problem_children = []

    if "msaid" in msa.keys():
        fubar = fubar_analysis(msa["msaid"],treemode,pvalue,sendmail)
        fubar_collection.append((fn,fubar))
        print("succeeded fn: " + fn)
        print("succeeded fn id: " + msa["msaid"])
        #Add to collection of analyses that have successfully been run

    else:
        #Add to problematic collection
        fubar_problem_children.append(fn)
        print("failed fn: " + fn)


