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
import requests

class TestMultipleSequenceAlignment(unittest.TestCase):

    def setUp(self):
        self.mail = 'sweaver@ucsd.edu'
        self.fn   = './res/HIV_gp120.nex'
        self.datatype = 0
        self.gencodeid = 0
        self.created_msa = msa.upload_file(self.fn, self.datatype,
                                           self.gencodeid, self.mail)

    # app.post('/msa', msa.uploadMsa);
    def test_upload(self):
        self.assertTrue(self.created_msa.id is not None)
        self.assertEqual(self.created_msa.datatype, self.datatype)
        self.assertEqual(self.created_msa.mailaddr, self.mail)
        self.assertEqual(self.created_msa.sequences, 6)
        self.assertEqual(self.created_msa.sites, 875)
        self.assertEqual(self.created_msa.gencodeid, self.gencodeid)

    # app.get('/msa/:id', msa.findById);
    def test_findbyid(self):
        msa_obj = msa.get_by_id(self.created_msa.id)
        self.assertEqual(msa_obj.id, self.created_msa.id)
        self.assertEqual(msa_obj.datatype, self.created_msa.datatype)
        self.assertEqual(msa_obj.mailaddr, self.created_msa.mailaddr)
        self.assertEqual(msa_obj.sequences, self.created_msa.sequences)
        self.assertEqual(msa_obj.sites, self.created_msa.sites)
        self.assertEqual(msa_obj.gencodeid, self.created_msa.gencodeid)

    # app.put('/msa/:id', msa.updateMsa);
    def test_update(self):
        self.created_msa.partitions = 15
        msa_obj = msa.update(vars(self.created_msa))
        self.assertEqual(msa_obj.partitions, 15)

    # app.delete('/msa/:id', msa.deleteMsa);
    def test_delete(self):
        success = msa.delete(self.created_msa.id)
        self.assertEqual(success["success"], 1)
        self.assertRaises(requests.exceptions.HTTPError, msa.get_by_id,
                          self.created_msa.id)


if __name__ == '__main__':
    unittest.main()

