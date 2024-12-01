import sys
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

# Define shape mapping
shape_mapping = {0: 'square', 1: 'circle', 2: 'triangle'}

# Generate a sequence based on difficulty level
def generate_pattern(difficulty):
    print(f"Generating pattern for difficulty level: {difficulty}")
    if difficulty == 'easy':
        sequence_length = 3  # Only square/circle
        sequence = [np.random.randint(0, 2) for _ in range(sequence_length)]
    elif difficulty == 'medium':
        sequence_length = 4  # Square/circle/triangle
        sequence = [np.random.randint(0, 3) for _ in range(sequence_length)]
    elif difficulty == 'hard':
        sequence_length = 5  # Descending order
        sequence = sorted([np.random.randint(0, 3) for _ in range(sequence_length)], reverse=True)
    else:
        raise ValueError("Invalid difficulty level. Use 'easy', 'medium', or 'hard'.")
    print(f"Generated Pattern: {sequence}")
    return sequence

# Predict the next shape
def predict_next_shape(model, sequence):
    # Reshape for the LSTM model
    sequence = np.array(sequence).reshape((1, len(sequence), 1))

    # Predict the next shape
    prediction = model.predict(sequence)
    next_shape = np.argmax(prediction)

    # Map back to shape name
    return shape_mapping[next_shape]

if __name__ == "__main__":
    # Get difficulty level from command-line argument
    if len(sys.argv) > 1:
        difficulty = sys.argv[1]
    else:
        print("No difficulty level provided. Using default: 'medium'")
        difficulty = 'medium'

    # Load the pre-trained model
    try:
        model_path = './pickle/pattern_recognition_model.h5'
        print(f"Loading model from: {model_path}")
        model = load_model(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load the model. Error: {e}")
        sys.exit(1)

    # Generate a random pattern
    pattern = generate_pattern(difficulty)

    # Predict the next shape
    next_shape = predict_next_shape(model, pattern)

    # Output the result
    print({
        "pattern": [shape_mapping[i] for i in pattern],
        "next_shape": next_shape
    })
