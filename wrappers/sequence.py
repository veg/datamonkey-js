import dm

#We need to define datatypes and gencodes in the database

#Need to create users
def create_sequence(fn,datatype,gencode):
    #Need to add name
    #Sites and Sequences are to be added on the backend
    method = "/sequence"
    fh = open(fn, 'rb')
    response = dm.post(method,seq=fh,datatype=datatype,gencode=gencode)
    return response

def get_all_sequences():
    method = "/sequence"
    response = dm.get(method,params=None)
    return response

if __name__ == "__main__":
    print create_sequence('/Users/sweaver/Documents/NexusFiles/HIV_gp120.nex',0,0)

