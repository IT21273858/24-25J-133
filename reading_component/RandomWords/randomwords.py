import friendlywords as fw

def getSingleword():
    word = fw.generate(1)
    print("the SIngle Words is ",word)
    return word

def getSingleWordMax(limit=4):
    while True:
        word = fw.generate(1)
        if len(word) <= limit:
            print("The Single Word (Max limit Letters) is:", word)
            return word


def getsinglephrase():
    phrase = fw.generate('po')
    print("the random prahse ",phrase)
    return phrase