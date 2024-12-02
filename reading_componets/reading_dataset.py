import pandas as pd
import random
import os
import json

os.makedirs('./reading_datasets', exist_ok=True, mode=0o777)
# Phonemic Awareness Task Dataset
phonemic_awareness = [
    {"word": "cat", "phonemes": ["k", "æ", "t"]},
    {"word": "bat", "phonemes": ["b", "æ", "t"]},
    {"word": "dog", "phonemes": ["d", "ɒ", "g"]},
    {"word": "sun", "phonemes": ["s", "ʌ", "n"]},
    {"word": "top", "phonemes": ["t", "ɒ", "p"]},
]

# Phonic Task Dataset
phonic_tasks = [
    {"word": "key", "phonics": "k-ee"},
    {"word": "kite", "phonics": "k-ite"},
    {"word": "knight", "phonics": "n-ight"},
    {"word": "blue", "phonics": "b-l-ue"},
    {"word": "shoe", "phonics": "sh-oo"},
]

# Fluency Task Dataset
fluency_tasks = [
    {
        "passage": "The quick brown fox jumps over the lazy dog.",
        "target_time_seconds": 10,
    },
    {
        "passage": "She sells sea shells by the sea shore.",
        "target_time_seconds": 12,
    },
    {
        "passage": "Peter Piper picked a peck of pickled peppers.",
        "target_time_seconds": 15,
    },
]

# Comprehension Task Dataset
comprehension_tasks = [
    {
        "passage": "John loves to play football in the park every weekend.",
        "questions": [
            {"question": "Who loves to play football?",
                "options": ["John", "Jane"], "answer": "John"},
            {"question": "Where does John play football?",
                "options": ["Park", "School"], "answer": "Park"},
        ],
    },
    {
        "passage": "Mary went to the market to buy fresh fruits and vegetables.",
        "questions": [
            {"question": "What did Mary buy?", "options": [
                "Fruits and Vegetables", "Clothes"], "answer": "Fruits and Vegetables"},
            {"question": "Where did Mary go?", "options": [
                "Market", "Mall"], "answer": "Market"},
        ],
    },
]

# Combine all data into a single dictionary
dataset = {
    "phonemic_awareness": phonemic_awareness,
    "phonic_tasks": phonic_tasks,
    "fluency_tasks": fluency_tasks,
    "comprehension_tasks": comprehension_tasks,
}

# Save dataset as JSON
with open("./reading_datasets/reading_skills_dataset.json", "w") as f:
    json.dump(dataset, f, indent=4)

# Save individual datasets as CSV
phonemic_awareness_df = pd.DataFrame(phonemic_awareness)
phonic_tasks_df = pd.DataFrame(phonic_tasks)
fluency_tasks_df = pd.DataFrame(fluency_tasks)
comprehension_tasks_df = pd.DataFrame(
    [{"passage": c["passage"], "questions": c["questions"]}
        for c in comprehension_tasks]
)

phonemic_awareness_df.to_csv(
    "./reading_datasets/phonemic_awareness.csv", index=False)
phonic_tasks_df.to_csv("./reading_datasets/phonic_tasks.csv", index=False)
fluency_tasks_df.to_csv("./reading_datasets/fluency_tasks.csv", index=False)
comprehension_tasks_df.to_csv(
    "./reading_datasets/comprehension_tasks.csv", index=False)

print("Datasets created successfully!")
