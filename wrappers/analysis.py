#
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

#Replace all the python files with single analysis python script
class Analysis:
    def __init__(self, msaid, type, params):
        u""" Starts a new asr for the given sequence."""
        self.type = None
        self.id = None
        self.create(msaid, type, params)

    def create(self, msaid, type, params):
        u""" Starts a new analysis for the given file. """

        # We need to have an option of whether they want mail
        # and/or want the call to block until finished, or neither
        self.type = type
        method = "/msa/{0}/{1}".format(msaid,self.type)
        params["msaid"] = msaid
        response = dm.post(method, params)
        self.id = response["id"]
        return response

    def status(self):
        u""" Returns current status of job """
        method = "/msa/{0}/{1}/{2}".format(msaid, self.type, self.id)
        response = dm.get(method, params=None)
        return response

    def results(self):
        u""" Returns results for analysis, or error if there is none """
        method = "/msa/{0}/asr/{1}/results".format(msaid, asrid)
        response = dm.get(method, params=None)
        return response

