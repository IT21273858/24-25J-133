from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import os
import base64
import random


# Suppress TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Initialize Flask app
app = Flask(__name__)

# Load the models
shape_model = tf.keras.models.load_model("./pickle/shape_recognition_model.h5")
shape_model.compile()  # Compile the model to suppress warnings

pattern_model = tf.keras.models.load_model("./pickle/pattern_recognition_model.h5")
pattern_model.compile()  # Compile the model to suppress warnings


# Define shape mappings
shape_mapping = {0: "square", 1: "circle", 2: "triangle"}
reverse_mapping = {v: k for k, v in shape_mapping.items()}

# Define class names for image prediction
class_names = ["circle", "square", "triangle"]


#  IMAGE PREDICTION

# Preprocess the image for shape recognition
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (128, 128))
    img = img / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get the uploaded file
        file = request.files.get("image")
        if not file:
            return jsonify({"error": "No image uploaded"}), 400

        # Save the file temporarily
        file_path = f"temp_{file.filename}"
        file.save(file_path)

        # Preprocess and predict
        img = preprocess_image(file_path)
        predictions = shape_model.predict(img)
        predicted_class = class_names[np.argmax(predictions)]
        confidence = np.max(predictions)

        # Clean up the temporary file
        os.remove(file_path)

        print(f"Predicted Shape is {predicted_class} with confidence {confidence:.2f}")

        # Return the prediction
        return jsonify({"class": predicted_class, "confidence": float(confidence)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  PATTERN PREDICTION

# Generate a sequence based on difficulty level
def generate_pattern(difficulty):
    if difficulty == "easy":
        sequence_length = 3  # Easy: 3 shapes
        sequence = [
            np.random.randint(0, 2) for _ in range(sequence_length)
        ]  # Only square/circle
    elif difficulty == "medium":
        sequence_length = 4  # Medium: 4 shapes
        sequence = [
            np.random.randint(0, 3) for _ in range(sequence_length)
        ]  # Square/circle/triangle
    elif difficulty == "hard":
        sequence_length = 5  # Hard: 5 shapes
        sequence = sorted(
            [np.random.randint(0, 3) for _ in range(sequence_length)], reverse=True
        )  # Descending order
    else:
        raise ValueError("Invalid difficulty level. Use 'easy', 'medium', or 'hard'.")
    return sequence


# Predict the next shape
def predict_next_shape(sequence):
    # Reshape the sequence for the LSTM model
    sequence = np.array(sequence).reshape((1, len(sequence), 1))

    # Predict the next shape
    prediction = pattern_model.predict(sequence)
    next_shape = np.argmax(prediction)

    # Map the predicted shape back to its name
    return shape_mapping[next_shape]


# Generate Shapes
def generate_shape_image(shape, img_size=128):
    """
    Args:
        shape (str): Type of shape ('circle', 'square', 'triangle').
        img_size (int): Size of the image (width and height).
    Returns:
        np.array: Generated image with the shape.
    """
    img = np.zeros((img_size, img_size, 3), dtype=np.uint8)  # Black background
    color = tuple(np.random.randint(0, 256, size=3).tolist())  # Random color
    center = (np.random.randint(30, img_size - 30), np.random.randint(30, img_size - 30))
    radius = np.random.randint(20, 50)

    if shape == "circle":
        cv2.circle(img, center, radius, color, -1)
    elif shape == "square":
        top_left = (center[0] - radius, center[1] - radius)
        bottom_right = (center[0] + radius, center[1] + radius)
        cv2.rectangle(img, top_left, bottom_right, color, -1)
    elif shape == "triangle":
        pt1 = (center[0], center[1] - radius)
        pt2 = (center[0] - radius, center[1] + radius)
        pt3 = (center[0] + radius, center[1] + radius)
        cv2.drawContours(img, [np.array([pt1, pt2, pt3])], 0, color, -1)

    return img

@app.route("/predict-pattern", methods=["POST"])
def predict_pattern():
    try:
        # Get difficulty level from the request body
        data = request.get_json()
        difficulty = data.get("difficulty")

        if not difficulty:
            return (
                jsonify(
                    {"error": "Difficulty level is required ('easy', 'medium', 'hard')"}
                ),
                400,
            )

        # Generate a random pattern
        pattern = generate_pattern(difficulty)

        # Predict the next shape in the sequence
        next_shape = predict_next_shape(pattern)

        # Map the pattern to their shape names
        pattern_shapes = [shape_mapping[i] for i in pattern]

        print(f"Generated Pattern: {pattern_shapes}")
        print(f"Predicted Next Shape: {next_shape}")

        # Return the response
        return jsonify({"pattern": pattern_shapes, "next_shape": next_shape})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-shapes", methods=["POST"])
def generate_shapes():
    try:
        # Get the number of shapes to generate from the request
        data = request.get_json()
        num_shapes = data.get("num_shapes", 5)  # Default to 5 shapes

        # Ensure the number of shapes is valid
        if num_shapes <= 0 or num_shapes > 100:
            return jsonify({"error": "Number of shapes must be between 1 and 100."}), 400

        response = []
        for _ in range(num_shapes):
            # Randomly select a shape
            shape_name = random.choice(shape_mapping)

            # Generate the shape image
            shape_img = generate_shape_image(shape_name)

            # Convert the image to Base64
            _, buffer = cv2.imencode(".png", shape_img)
            image_base64 = base64.b64encode(buffer).decode("utf-8")

            # Append the result
            response.append({"shape": shape_name, "image": image_base64})

        return jsonify({"shapes": response, "message": "Shapes generated successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
