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

def get_all_meme():
    method = "/seqfile/{0}/meme".format(seqid)
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    #No need for this
    msa = seqfile.create_seqfile('/Users/sweaver/Documents/NexusFiles/HIV_gp120.nex',0,0)

    #Neighbor Joining
    treemode = 0
    modelstring = "010010"
    pvalue = 0.5

    meme = meme_analysis(msa["_id"],treemode,modelstring,pvalue)

    #get_meme_status(msa["_id"],meme["id"])

    #msaid  = '511430f37b87657169000001'
    #memeid = '51144a0da37f45f777000002'
    #print get_meme_status(msaid,memeid)

