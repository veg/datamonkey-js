import dm

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

    method = "/sequence/{0}/analysis".format(seqid)
    response = dm.post(method,seqid=seqid,treemode=treemode,modelstring=modelstring,pvalue=pvalue)
    return response

def get_all_analysis():
    method = "/analysis"
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":

    seqid = "50dccf2b35f9295865000002"
    treemode = 0
    modelstring = 0
    pvalue = 0.5

    meme_analysis(seqid,treemode,modelstring,pvalue)
