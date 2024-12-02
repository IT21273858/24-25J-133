import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd
import os

os.makedirs('./pickle_reading', exist_ok=True, mode=0o777)

# Load the fluency task dataset
fluency_tasks_df = pd.read_csv("./reading_datasets/fluency_tasks.csv")

# Preprocess the data
# Convert the target_time_seconds and passage length into features
fluency_tasks_df['passage_length'] = fluency_tasks_df['passage'].apply(len)
fluency_tasks_df['target_time'] = fluency_tasks_df['target_time_seconds']
fluency_tasks_df['accuracy'] = fluency_tasks_df['target_time'].apply(
    lambda x: 1 if x <= 12 else 0  # Example accuracy condition
)

# Features (time_taken simulated here) and labels
fluency_data = fluency_tasks_df[['target_time', 'passage_length']]
fluency_data['time_taken'] = fluency_tasks_df['target_time'] * \
    1.2  # Simulate time taken

X = fluency_data[['time_taken', 'target_time', 'passage_length']]
y = fluency_tasks_df['accuracy']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# Train a RandomForest model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print("Model Accuracy:", accuracy_score(y_test, y_pred))

# Save the model for later use
joblib.dump(model, "./pickle_reading/fluency_model.pkl")
print("Model saved as fluency_model.pkl")
