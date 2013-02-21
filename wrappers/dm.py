import simplejson as json
import urllib
import requests

#TODO: Change prints to logger
URL="http://datamonkey-dev:3000"

#A Generic API POST call
def post(method, **kwargs):
    url = URL + method
    r = requests.post(url, params=kwargs)
    return json.loads(r.text) if r.text else None

def get(method, **kwargs):
    url = URL + method
    r = requests.get(url, params=kwargs)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def put(method, **kwargs):
    url = URL + method
    r = requests.put(url, params=kwargs)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None


def delete(method, **kwargs):
    url = URL + method
    r = requests.put(url, params=kwargs)
    r.raise_for_status()
    return json.loads(r.text) if r.text else None

def _test():
    #print post("",)
    pass

if __name__ == "__main__":
    _test()
