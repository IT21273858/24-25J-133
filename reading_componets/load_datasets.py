import pandas as pd
import json

# Load JSON dataset
with open("./reading_datasets/reading_skills_dataset.json", "r") as f:
    dataset = json.load(f)

# Print dataset structure
print("Phonemic Awareness Sample:", dataset["phonemic_awareness"][:2])
print("Fluency Task Sample:", dataset["fluency_tasks"][:2])

# Load individual CSV files
phonemic_awareness_df = pd.read_csv(
    "./reading_datasets/phonemic_awareness.csv")
phonic_tasks_df = pd.read_csv("./reading_datasets/phonic_tasks.csv")
fluency_tasks_df = pd.read_csv("./reading_datasets/fluency_tasks.csv")
comprehension_tasks_df = pd.read_csv(
    "./reading_datasets/comprehension_tasks.csv")

# Display samples
print("\nPhonemic Awareness CSV Sample:")
print(phonemic_awareness_df.head())
