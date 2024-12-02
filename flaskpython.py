from flask import Flask, request, jsonify, send_file
import tensorflow as tf
import numpy as np
import cv2
import os
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

shape_generation_model = tf.keras.models.load_model("./pickle/shape_generation_model.h5")
shape_generation_model.compile()  # Compile the model to suppress warnings

# Define shape mappings
shape_mapping = {0: "square", 1: "circle", 2: "triangle"}
reverse_mapping = {v: k for k, v in shape_mapping.items()}

# Define class names for image prediction
class_names = ["circle", "square", "triangle"]

# Shape generation

def generate_shape_from_model(shape_type=None):
    """
    Generate a predefined image for the requested shape type.
    """
    img_size = (128, 128)

    # Default to random shape if not specified
    shape_type = shape_type or random.choice(["circle", "square", "triangle"])

    # Create an empty image
    img = np.zeros((*img_size, 3), dtype=np.uint8)

    # Define the center and size
    center = (img_size[0] // 2, img_size[1] // 2)
    size = 40

    if shape_type == "circle":
        cv2.circle(img, center, size, (255, 255, 255), -1)
    elif shape_type == "square":
        top_left = (center[0] - size, center[1] - size)
        bottom_right = (center[0] + size, center[1] + size)
        cv2.rectangle(img, top_left, bottom_right, (255, 255, 255), -1)
    elif shape_type == "triangle":
        pts = np.array([
            [center[0], center[1] - size],
            [center[0] - size, center[1] + size],
            [center[0] + size, center[1] + size]
        ], np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.fillPoly(img, [pts], (255, 255, 255))

    # Normalize pixel values for compatibility with other models
    img = img / 255.0
    return img, shape_type

def preprocess_imagegen(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (128, 128))
    img = img / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img



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



import base64

@app.route("/generate-and-predict", methods=["GET"])
def generate_and_predict():
    try:
        # Generate a predefined shape image
        generated_img, true_shape = generate_shape_from_model()

        # Add batch dimension for model compatibility
        processed_img = np.expand_dims(generated_img, axis=0)

        # Predict the shape using the shape recognition model
        predictions = shape_model.predict(processed_img)
        predicted_class = class_names[np.argmax(predictions)]
        confidence = np.max(predictions)

        # Save the generated image temporarily
        temp_image_path = "generated_shape.png"
        cv2.imwrite(temp_image_path, np.uint8(generated_img * 255))

        # Convert the image to a Base64 string
        with open(temp_image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        # Delete the temporary image file after encoding
        os.remove(temp_image_path)

        print(f"Generated Shape: {true_shape}")
        print(f"Predicted Shape: {predicted_class} with Confidence: {confidence:.2f}")

        # Return JSON response including Base64 image
        return jsonify({
            "true_shape": true_shape,
            "predicted_shape": predicted_class,
            "confidence": float(confidence),
            "image_base64": base64_image
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(port=5000)
