import tensorflow as tf
import numpy as np
import cv2
import sys
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow INFO and WARNING messages

# Load the trained model
model = tf.keras.models.load_model('shape_recognition_model.h5')

# Compile the model (optional, to suppress warning)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Define class names
class_names = ['circle', 'square', 'triangle']

# Function to preprocess the input image
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (128, 128))  # Resize to model input size
    img = img / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

# Main function to predict the class of the input image
def predict(image_path):
    try:
        # Preprocess image
        img = preprocess_image(image_path)

        # Perform prediction
        predictions = model.predict(img)
        predicted_class = class_names[np.argmax(predictions)]
        confidence = np.max(predictions)

        print("Model loaded successfully.")
        print(f"Image Path: {image_path}")
        print(f"Predictions: {predictions}")
        return {"class": predicted_class, "confidence": float(confidence)}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
    else:
        result = predict(sys.argv[1])
        print(result)
