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

def upload_file(fn, datatype, gencode, mailaddr=""):
    u""" Starts a new analysis for the given file. """

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = "/msa"
    fh = {"file":(fn, open(fn,'rb').read())}

    params = {
        "files"       : fh,
        "datatype"    : datatype,
        "gencodeid"   : gencode,
        "mailaddr"    : mailaddr
    }

    json = dm.post(method, params)
    return MSA(json)


#We need to define datatypes and gencodes in the database
class MSA:
    def __init__(self, msa):
        u""" Initializes Multiple Sequence Alignment """
        self.id         = msa.get('msaid')
        self.gencodeid  = msa.get('gencodeid'),
        self.datatype   = msa.get('datatype'),
        self.msaid      = msa.get('msaid'),
        self.partitions = msa.get('partitions'),
        self.sites      = msa.get('sites'),
        self.rawsites   = msa.get('rawsites'),
        self.sequences  = msa.get('sequences'),
        self.goodtree   = msa.get('goodtree'),
        self.nj         = msa.get('nj'),
        self.timestamp  = msa.get('timestamp'),
        self.mailaddr   = msa.get('mailaddr')
