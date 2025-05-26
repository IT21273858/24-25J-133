import Levenshtein



def calculate_cer(target, input):
    """
    Calculate Character Error Rate (CER) between target and input.
    """
    target = target.lower()
    input = input.lower()
    distance = Levenshtein.distance(target, input)
    cer = distance / len(target)
    return cer

