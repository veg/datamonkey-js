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

def uds_analysis(msaid, namedmodel, modelstring, dnds, ambchoice,
                    pvalue, sendmail=False, block=False):
    u"""Starts a new uds for the given sequence."""

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = "/msa/{0}/uds".format(msaid)

    response = dm.post(method, msaid=msaid, namedmodel=namedmodel,
                       modelstring=modelstring, dnds=dnds, ambchoice=ambchoice,
                       pvalue=pvalue, sendmail=sendmail, block=block)

    return response

def get_uds_status(msaid, udsid):
    u"""Returns current status of job"""

    method = "/msa/{0}/uds/{1}".format(msaid, udsid)
    response = dm.get(method, params=None)
    return response

def get_uds_results(msaid, udsid):
    u"""Returns results for analysis, or error if there is none"""

    method = "/msa/{0}/uds/{1}/results".format(msaid, udsid)
    response = dm.get(method, params=None)
    return response

if __name__ == "__main__":
    mail = 'sweaver@ucsd.edu'
    fn   = './res/SRR049135.zip'

    msa = msa.create_msa(fn, 0, 0, mail)

    minread             = Number
    scorem              = Number
    mincoverage         = Number
    windowsize          = Number
    windowstride        = Number
    mincopycount        = Number
    nucdivthreshold     = Number
    dodr                = Number
    mindrugscore        = Number
    mindrugcoverage     = Number

    sendmail    = True

    #Start analysis. Receive ticket.
    uds = uds_analysis(msa["msaid"], namedmodel, modelstring, dnds, ambchoice,
                         pvalue, sendmail)

    print msa["msaid"]
    print uds

