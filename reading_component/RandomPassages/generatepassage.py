from wonderwords import RandomWord
import random
import nltk

# Initialize random word generator
rw = RandomWord()

# Sample sentence templates (you can expand this)
templates = [
    "The {adj} {noun} {verb} in the {place}.",
    "I {verb} a {adj} {noun} today.",
    "Look at the {adj} {noun} near the {place}.",
    "Can you {verb} the {adj} {noun}?",
    "The {noun} likes to {verb} when it is {adj}.",
    "My {noun} and I {verb} together at the {place}."
]

# Child-friendly words
places = ["park", "garden", "school", "beach", "playground"]
verbs = ["run", "jump", "play", "sing", "dance", "laugh", "clap", "skip"]
adjectives = ["happy", "bright", "shiny", "funny", "soft", "kind", "silly", "brave"]
nouns = [
    "dog", "cat", "bird", "car", "hat", "ball", "apple", "fish", "goat", "sun",
    "tree", "book", "toy", "cake", "train", "plane", "kite", "shoe", "bell", "star"
]

def conjugate(verb, noun):
    if noun.endswith('s') or noun in ['I', 'we', 'they']:
        return verb  # Plural or pronoun subjects - no 's'
    return verb + 's' if verb != 'play' else 'plays'  # Special case for 'play'


# Function to generate a passage
def generateRadomPassage(sentences=5):
    passage = []
    for _ in range(sentences):
        template = random.choice(templates)
        noun = random.choice(nouns)
        verb = random.choice(verbs)
        # Conjugate if needed
        if template.startswith("The") or template.startswith("Look at the"):
            verb = conjugate(verb, noun)
        sentence = template.format(
            adj=random.choice(adjectives),
            noun=noun,
            verb=verb,
            place=random.choice(places)
        )
        passage.append(sentence)
    return ' '.join(passage)

child_passage = generateRadomPassage(sentences=5)
print(child_passage)