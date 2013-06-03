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

def prime_analysis(msaid,treemode,prime_property_choice,sendmail=False,block=False):
    # We need to tell the API the method
    # A prime analysis requires:
    # sequence
    # treemode
    # (Model String and Named Model may be redundant)
    # modelstring
    # namedmodel
    # pvalue

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither

    #TODO: Have url friendly sequence ids

    method = "/msa/{0}/prime".format(msaid)
    response = dm.post(method,msaid=msaid,treemode=treemode,prime_property_choice=prime_property_choice,sendmail=sendmail,block=block)
    return response

def get_prime_status(msaid,primeid):
    method = "/msa/{0}/prime/{1}".format(msaid,primeid)
    response = dm.get(method,params=None)
    return response

def parse_prime_results(msaid,primeid):
    method = "/msa/{0}/prime/{1}/parse".format(msaid,primeid)
    response = dm.get(method,params=None)
    return response

def get_prime_results(msaid,primeid):
    method = "/msa/{0}/prime/{1}/results".format(msaid,primeid)
    response = dm.get(method,params=None)
    return response

def mail_prime_results(msaid,primeid):
    method = "/msa/{0}/prime/{1}/mail".format(msaid,primeid)
    response = dm.get(method,params=None)
    return response

def parse_prime_results(msaid,primeid):
    method = "/msa/{0}/prime/{1}/parseresults".format(msaid,primeid)
    response = dm.get(method,params=None)
    return response


def get_all_prime():
    method = "/msa/{0}/prime".format(msaid)
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    mail   = 'sweaver@ucsd.edu'
    fn   = './res/HIV_gp120.nex'
    msa = msa.create_msa(fn,0,0,mail)
    print msa

    #Neighbor Joining
    treemode = 0
    prime_property_choice = 0;
    sendmail = True;

    prime = prime_analysis(msa["msaid"],treemode,prime_property_choice,sendmail)
    print msa["msaid"]
    print prime
