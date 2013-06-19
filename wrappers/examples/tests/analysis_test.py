#!/usr/bin/env python

#  Datamonkey - An API for comparative analysis of sequence alignments using
#  state-of-the-art statistical models.
#
#  Copyright (C) 2013
#  Sergei L Kosakovsky Pond (spond@ucsd.edu)
#  Steven Weaver (sweaver@ucsd.edu)
#
#  Permission is hereby granted, free of charge, to any person obtaining a
#  copy of this software and associated documentation files (the
#  'Software'), to deal in the Software without restriction, including
#  without limitation the rights to use, copy, modify, merge, publish,
#  distribute, sublicense, and/or sell copies of the Software, and to
#  permit persons to whom the Software is furnished to do so, subject to
#  the following conditions:
#
#  The above copyright notice and this permission notice shall be included
#  in all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
#  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
#  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
#  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
#  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
#  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
#  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import sys
sys.path.append('../../classes/')

import unittest
import time
import msa
import analysis
import requests

class TestAnalysis(unittest.TestCase):

    def setUp(self):
        self.mail = 'sweaver@ucsd.edu'
        self.fn   = './res/HIV_gp120.nex'
        self.datatype = 0
        self.gencodeid = 0
        self.type = 'meme'
        self.created_analysis = msa.upload_file(self.fn, self.datatype,
                                           self.gencodeid, self.mail)

        self.meme_params = {
            'treemode'    : 0,
            'modelstring' : '010010',
            'pvalue'      : 0.1,
            'sendmail'    : True
        }

        self.meme_analysis = analysis.create_analysis(self.created_analysis.id,
                                                      self.type,
                                                      self.meme_params)

    ##app.post('/msa/:msaid/:type', analysis.invokeJob);
    #def test_invokejob(self):
    #    self.assertTrue(self.meme_analysis.id is not None)
    #    self.assertTrue(self.meme_analysis.msaid is not None)
    #    self.assertEqual(self.meme_analysis.type, self.type)
    #    self.assertTrue(self.meme_analysis.status is not None)
    #    self.assertTrue(self.meme_analysis.sendmail is not None)

    ##app.get('/msa/:msaid/:type/:analysisid', analysis.getResults);
    #def test_findbyid(self):
    #    analysis_obj = analysis.get_by_id(self.meme_analysis.id,
    #                                      self.created_analysis.id,
    #                                      self.type)

    #    self.assertEqual(analysis_obj.id, self.meme_analysis.id)
    #    self.assertEqual(analysis_obj.msaid, self.meme_analysis.msaid)
    #    self.assertEqual(analysis_obj.type, self.meme_analysis.type)
    #    self.assertEqual(analysis_obj.sendmail, self.meme_analysis.sendmail)

    ## app.get('/msa/:msaid/:type/:analysisid/status', analysis.queryStatus);
    #def test_status(self):
    #    status = self.meme_analysis.get_status()
    #    possible_statuses = ["running", "queueing", "finished", "cancelled"]
    #    self.assertTrue(status in possible_statuses)

    # app.delete('/analysis/:id', analysis.deleteanalysis);
    def test_delete(self):
        success = analysis.delete(self.meme_analysis.id,
                                  self.created_analysis.id,
                                  self.type)

        self.assertEqual(success["success"], 1)
        self.assertRaises(requests.exceptions.HTTPError, analysis.get_by_id,
                          self.meme_analysis.id, self.created_analysis.id,
                          self.type)


if __name__ == '__main__':
    unittest.main()


