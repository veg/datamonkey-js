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
import time

def create_analysis(msaid, type, params):
    u""" Starts a new analysis for the given file. """
    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = '/msa/{0}/{1}'.format(msaid, type)
    params["msaid"] = msaid
    json = dm.post(method, params)
    return Analysis(json)

def get_analysis(id, msaid, type, params):
    u""" Starts a new analysis for the given file. """
    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = '/msa/{0}/{1}'.format(msaid, type)
    json = dm.get(method)
    return Analysis(json)

#Replace all the python files with single analysis python script
class Analysis:
    def __init__(self, analysis):
        u""" Starts a new asr for the given sequence."""
        self.id     = analysis.get("id")
        self.type   = analysis.get("type")
        self.msaid  = analysis.get("msaid")
        self.status = analysis.get("msaid")

    def poll(self):
        while 1:
            time.sleep(5)
            self.update_status()
            if self.status != "queueing" and self.status != "running":
                return

    def update_status(self):
        u""" Returns current status of job """
        method = '/msa/{0}/{1}/{2}/status'.format(self.msaid, self.type,
                                                  self.id)
        response = dm.get(method, params=None)
        self.status = response.get('status')
        return response
