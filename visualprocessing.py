# gan_shape_utils.py
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
from io import BytesIO
import base64
import cv2
import os
from flask import Flask, request, jsonify
from flask import Blueprint

generator = load_model("gan_shape_generator.keras")
latent_dim = 100
label_dict = {"circle": 0, "square": 1, "triangle": 2, "star": 3, "airplane": 4}
num_classes = len(label_dict)

def generate_gan_shape(label_name):
    if label_name not in label_dict:
        return None, "Invalid label"

    noise = tf.random.normal((1, latent_dim))
    label_idx = label_dict[label_name]
    label = tf.one_hot([label_idx], depth=num_classes)

    img = generator([noise, label], training=False)[0, :, :, 0].numpy()
    img = (img * 255).astype(np.uint8)

    image = Image.fromarray(img, mode='L').resize((112, 112), Image.NEAREST)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded_img = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return encoded_img, None



# new_shape_prediction.py

# Load new model
new_shape_model = tf.keras.models.load_model("./pickle/shape_prediction_model.keras")
new_categories = ["circle", "square", "triangle", "star", "airplane"]

# Preprocessing function
def preprocess_new_shape_image(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (28, 28))
    img = img / 255.0
    img = np.expand_dims(img, axis=(0, -1))  # Add batch & channel dims
    return img


# function to predict shape
def predict_new_shape():
    try:
        file = request.files.get("image")
        if not file:
            return jsonify({"error": "No image uploaded"}), 400

        file_path = f"temp_{file.filename}"
        file.save(file_path)

        img = preprocess_new_shape_image(file_path)
        predictions = new_shape_model.predict(img)
        predicted_class = new_categories[np.argmax(predictions)]
        confidence = float(np.max(predictions))

        os.remove(file_path)

        return jsonify({
            "prediction": predicted_class,
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



gan_controller = Blueprint('gan_controller', __name__)

# Load your trained generator model
generator = tf.keras.models.load_model("gan_shape_generator.keras")
latent_dim = 100
label_dict = {"circle": 0, "square": 1, "triangle": 2, "star": 3, "airplane": 4}
num_classes = len(label_dict)

@gan_controller.route("/get-gan-shape", methods=["POST"])
def get_gan_shape():
    try:
        data = request.get_json()
        shape_name = data.get("shape", "circle")
        if shape_name not in label_dict:
            return jsonify({"error": "Invalid shape name"}), 400

        noise = tf.random.normal((1, latent_dim))
        label = tf.one_hot([label_dict[shape_name]], depth=num_classes)
        generated_image = generator([noise, label], training=False)[0, :, :, 0].numpy()
        generated_image = (generated_image * 255).astype(np.uint8)

        # Convert to base64
        _, buffer = cv2.imencode(".png", generated_image)
        image_base64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({"success": True, "image_base64": image_base64, "shape": shape_name})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
