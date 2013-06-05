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

#We need to define datatypes and gencodes in the database

#Need to create users
def create_msa(fn,datatype,gencode,mailaddr=""):
    #Need to add name
    #Sites and Sequences are to be added on the backend
    method = "/msa"
    fh = {"file":(fn, open(fn,'rb').read())}
    response = dm.post(method,files=fh,datatype=datatype, genCodeId=gencode, mailaddr=mailaddr)
    return response

def upload_scueal(fn,mailaddr=""):
    #Need to add name
    #Sites and Sequences are to be added on the backend
    method = "/msa"
    fh = {"file":(fn, open(fn,'rb').read())}
    response = dm.post(method,files=fh,scueal=1,mailaddr=mailaddr)
    return response

def upload_uds(fn,mailaddr=""):
    #Need to add name
    #Sites and Sequences are to be added on the backend
    method = "/msa"
    fh = {"file":(fn, open(fn,'rb').read())}
    response = dm.post(method,files=fh,uds=1,mailaddr=mailaddr)
    return response

def get_all_sequences():
    method = "/msa"
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":
    print(create_msa('/Users/sweaver/Documents/NexusFiles/HIV_gp120.nex',0,0))

