import json
import time
import datetime
import pymongo

from pymongo import MongoClient
client = MongoClient()
db = client['datamonkey-dev']

f = open( './slac_usage.json', 'r' )
slacs = json.loads(f.read())

msas = db.msas

#time_ins = time.strptime("Sun Nov 21 00:15:36 2010", "%a %b %d %H:%M:%S %Y")
c = 0

for slac in slacs:
  up_id = "upload_test_" + str(c)
  start_time = datetime.datetime.fromtimestamp(time.mktime(time.strptime(slac["date"], "%a %b %d %H:%M:%S %Y")))

  msa = {"sequences": slac["seq"], "sites": slac["site"], "created" : start_time, "upload_id": up_id }
  msa_id = msas.insert(msa)
  slacmut_id = db.slacmutations.insert({ "ns" : slac["ns"] })
  slac_id = db.slacs.insert({'created': start_time, "cpu_time": slac["time"], "slacmutation": slacmut_id, "upload_id": msa_id, "status": "finished", "pvalue":slac["pv"], "modelstring": slac["model"]})
  c = c + 1
