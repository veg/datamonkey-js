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

import simplejson as json
import urllib
import requests

#TODO: Change prints to logger
URL="http://datamonkey-dev:3000"

#A Generic API POST call
def post(method, params):
    url = URL + method
    if "files" in params.keys():
        files = params["files"]
        del params["files"]
        r = requests.post(url, files, params=params)
    else:
        r = requests.post(url, params=params)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def get(method, params):
    url = URL + method
    r = requests.get(url, params=params)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def put(method, **kwargs):
    url = URL + method
    r = requests.put(url, params=params)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def delete(method, params):
    url = URL + method
    r = requests.put(url, params=params)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def _test():
    #print post("",)
    pass

if __name__ == "__main__":
    _test()
