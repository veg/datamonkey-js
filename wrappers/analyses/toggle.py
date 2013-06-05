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


import dm
import msa

def toggle_analysis(msaid, treemode, modelstring, ambchoice, pvalue,
                    sendmail=False, block=False):
    # We need to tell the API the method
    # A toggle analysis requires:
    # sequence
    # treemode
    # (Model String and Named Model may be redundant)
    # modelstring
    # namedmodel
    # pvalue

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither

    #TODO: Have url friendly sequence ids

    method = "/msa/{0}/toggle".format(msaid)
    response = dm.post(method,msaid=msaid,treemode=treemode,modelstring=modelstring,
                       pvalue=pvalue,sendmail=sendmail,block=block)
    return response

def get_toggle_status(msaid,toggleid):
    method = "/msa/{0}/toggle/{1}".format(msaid,toggleid)
    response = dm.get(method,params=None)
    return response

def parse_toggle_results(msaid,toggleid):
    method = "/msa/{0}/toggle/{1}/parse".format(msaid,toggleid)
    response = dm.get(method,params=None)
    return response

def get_toggle_results(msaid,toggleid):
    method = "/msa/{0}/toggle/{1}/results".format(msaid,toggleid)
    response = dm.get(method,params=None)
    return response

def mail_toggle_results(msaid,toggleid):
    method = "/msa/{0}/toggle/{1}/mail".format(msaid,toggleid)
    response = dm.get(method,params=None)
    return response

def parse_toggle_results(msaid,toggleid):
    method = "/msa/{0}/toggle/{1}/parseresults".format(msaid,toggleid)
    response = dm.get(method,params=None)
    return response


def get_all_toggle():
    method = "/msa/{0}/toggle".format(msaid)
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    mail = 'sweaver@ucsd.edu'
    fn   = '/home/sweaver/datamonkey-js/wrappers/res/HIV_gp120.nex'
    msa = msa.create_msa(fn,0,0,mail)

    #Neighbor Joining
    treemode    = 0
    modelstring = "010010"
    ambchoice   = 0
    pvalue      = 0.1
    sendmail    = True

    #Start analysis. Receive ticket.
    toggle = toggle_analysis(msa["msaid"],treemode,modelstring,ambchoice,
                             pvalue,sendmail)
    print toggle

