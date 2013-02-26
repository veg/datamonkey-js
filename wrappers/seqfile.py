import dm

#We need to define datatypes and gencodes in the database

#Need to create users
def create_seqfile(fn,datatype,gencode):

    #Need to add name
    #Sites and Sequences are to be added on the backend

    method = "/seqfile"
    fh = open(fn, 'rb')
    datatype = 0
    genCodeId = 0

    response = dm.post(method,contents=fh, datatype=datatype, genCodeId=genCodeId)

    return response

def get_all_sequences():
    method = "/seqfile"
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":
    print create_seqfile('/Users/sweaver/Documents/NexusFiles/HIV_gp120.nex',0,0)
    #print get_all_sequences()

