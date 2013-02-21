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

    #partitions = 1
    #sites = 513
    #rawSites = 1539
    #sequences = 36
    #goodTree = 1
    #nj = "(((Arath:0.188174,(Poptr1:0.10094,Ricco1:0.102011):0.0112149):0.0152961,(((((((Plama:0.311352,(Blama:0.294866,Rhoba:0.273323):0.0599034):0.183033,(Micpu:0.297791,(Chlre:0.159513,Volca:0.139779)
    #:0.134555):0.0398062):0.178006,Phypa:0.299975):0.0158994,Selmo:0.258957):0.0438404,(((Picsi2:0.0257613,Pinta2:0.032549):0.184905,(Pinta1:0.0267347,Picsi1:0.0196713):0.144343)
    #:0.0174714,((Nicta2:0.169622,(Vitvi4:0.136278,(Ricco3:0.102779,(Poptr2:0.0590652,Poptr3:0.0522931):0.0510329):0.0345479):0.0184362):0.074134,(Poptr4:0.116259,Ricco4:0.093799):0.159243):0.10003):0.0263246)
    #:0.0338262,(((Orysa1:0.0367949,Orysa2:0.048649):0.039795,Sorbi2:0.0877709)
    #:0.138636,(Orysa3:0.0734637,Sorbi1:0.0831877):0.101359):0.0610156):0.056883,((Vitvi2:0.0980996,(Poptr5:0.0952941,Ricco5:0.085331):0.0447624):0.0470318,(Vitvi3:0.11145,Ricco2:0.116944):0.0675077)
    #:0.0254363):0.0215324):0.0077702,(Jugre:0.252972,(Lyces:0.0494221,Nicta1:0.0808449):0.113769):0.00697103,Vitvi1:0.112664)"

    response = dm.post(method,contents=fh, datatype=datatype, genCodeId=genCodeId)

    return response

def get_all_sequences():
    method = "/seqfile"
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":
    print create_seqfile('/Users/sweaver/Documents/NexusFiles/HIV_gp120.nex',0,0)
    #print get_all_sequences()

