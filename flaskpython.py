from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
import os

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Initialize Flask app
app = Flask(__name__)

# Load the model
model = tf.keras.models.load_model('./pickle/shape_recognition_model.h5')
model.compile()  # Compile the model to suppress warnings

# Define class names
class_names = ['circle', 'square', 'triangle']

# Preprocess the image
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (128, 128))
    img = img / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the uploaded file
        file = request.files.get('image')
        if not file:
            return jsonify({'error': 'No image uploaded'}), 400

        # Save the file temporarily
        file_path = f"temp_{file.filename}"
        file.save(file_path)

        # Preprocess and predict
        img = preprocess_image(file_path)
        predictions = model.predict(img)
        predicted_class = class_names[np.argmax(predictions)]
        confidence = np.max(predictions)

        # Clean up the temporary file
        os.remove(file_path)

        print(f"Predicted Shape is {predicted_class} with confidence {confidence:.2f}")

        # Return the prediction
        return jsonify({'class': predicted_class, 'confidence': float(confidence)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
