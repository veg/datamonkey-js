import dm
import seqfile

def meme_analysis(seqid,treemode,modelstring,pvalue):
    # We need to tell the API the method
    # A meme analysis requires:
    # sequence
    # treemode
    # (Model String and Named Model may be redundant)
    # modelstring
    # namedmodel
    # pvalue

    #TODO: Have url friendly sequence ids

    method = "/seqfile/{0}/meme".format(seqid)
    response = dm.post(method,seqid=seqid,treemode=treemode,modelstring=modelstring,pvalue=pvalue)
    return response

def get_meme_status(seqid,memeid):
    method = "/seqfile/{0}/meme/{1}".format(seqid,memeid)
    response = dm.get(method,params=None)
    return response

def parse_meme_results(seqid,memeid):
    method = "/seqfile/{0}/meme/{1}/parse".format(seqid,memeid)
    response = dm.get(method,params=None)
    return response

def get_all_meme():
    method = "/seqfile/{0}/meme".format(seqid)
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    #No need for this
    #msa = seqfile.create_seqfile('/home/sweaver/datamonkey-js/wrappers/res/HIV_gp120.nex',0,0)

    #Neighbor Joining
    #treemode = 0
    #modelstring = "010010"
    #pvalue = 0.5

    #meme = meme_analysis(msa["_id"],treemode,modelstring,pvalue)

    #get_meme_status(msa["_id"],meme["id"])

    msaid  = '512bcd83ed8920b771000001'
    memeid = '5126925b0ca89ba230000002'
    print parse_meme_results(msaid,memeid)

