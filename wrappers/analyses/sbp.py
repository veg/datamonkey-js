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

def sbp_analysis(msaid, methodname, methodstring, rateoption, rateclasses,
                  sendmail=False, block=False):
    u"""Starts a new sbp for the given sequence."""

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = "/msa/{0}/sbp".format(msaid)

    response = dm.post(method, msaid=msaid, methodname=methodname,
                       methodstring=methodstring, rateoption=rateoption,
                       rateclasses=rateclasses, sendmail=sendmail, block=block)

    return response

def get_sbp_status(msaid, sbpid):
    u"""Returns current status of job"""

    method = "/msa/{0}/sbp/{1}".format(msaid, sbpid)
    response = dm.get(method, params=None)
    return response

def get_sbp_results(msaid, sbpid):
    u"""Returns results for analysis, or error if there is none"""

    method = "/msa/{0}/sbp/{1}/results".format(msaid, sbpid)
    response = dm.get(method, params=None)
    return response

if __name__ == "__main__":

    mail = 'sweaver@ucsd.edu'
    fn   = './res/HIV_gp120.nex'
    msa = msa.create_msa(fn, 0, 0, mail)

    method_name = ""
    method_string = "10110"
    rateoption = 2
    rateclasses = 2

    #Parameters
    sendmail = True

    #Start analysis. Receive ticket.
    sbp = sbp_analysis(msa["msaid"], method_name, method_string, rateoption,
                         rateclasses, sendmail)

    print msa["msaid"]
    print sbp

