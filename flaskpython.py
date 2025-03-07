from nltk.tokenize import sent_tokenize
from nltk.corpus import gutenberg
from nltk.corpus import words
from flask import Flask, request, jsonify, send_file
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import os
from diffusers import DiffusionPipeline
import torch
from PIL import Image
import random
import nltk
import syllapy
import base64

from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
from transformers import BertTokenizer
import time
# Suppress TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Initialize Flask app
app = Flask(__name__)


# stable-diffustion-pipleine-path
PIPELINE_DIR = "./stable_diffusion_pipeline"
nltk.download('words')
nltk.download('gutenberg')
nltk.download('punkt_tab')


# Load the models
shape_model = tf.keras.models.load_model("./pickle/shape_recognition_model.h5")

shape_model.compile()  # Compile the model to suppress warnings

pattern_model = tf.keras.models.load_model(
    "./pickle/pattern_recognition_model.h5")
pattern_model.compile()  # Compile the model to suppress warnings

shape_generation_model = tf.keras.models.load_model("./pickle/shape_generation_model.h5")
shape_generation_model.compile()  # Compile the model to suppress warnings

word_model = tf.keras.models.load_model("./pickle/predict_word_model.h5")
word_model.compile()

# Load the digit sequence model
digit_sequence_model = tf.keras.models.load_model("./pickle/digit_sequence_model.h5")
digit_sequence_model.compile()  # Compile to suppress warnings


# Load the pre-trained tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
print("Tokenizer saved successfully!")

# Define shape mappings
shape_mapping = {0: "square", 1: "circle", 2: "triangle"}
reverse_mapping = {v: k for k, v in shape_mapping.items()}

# Define class names for image prediction
class_names = ["circle", "square", "triangle"]

# Word levels
word_levels = {
    "Level 1": ['at', 'in', 'it', 'on', 'up', 'to'],
    "Level 2": ['cat', 'dog', 'bat', 'sun', 'fun', 'run'],
    "Level 3": ['love', 'code', 'kind', 'game', 'home', 'star'],
    "Level 4": ['train', 'apple', 'table', 'chair', 'house', 'robot']
}

# Define the route to generate and evaluate digit sequences
@app.route("/digit-sequence", methods=["POST"])
def digit_sequence():
    try:
        # Parse the request
        data = request.get_json()
        user_sequence = data.get("user_sequence", [])
        sequence_length = data.get("sequence_length", 5)

        if not user_sequence:
            return jsonify({"error": "User sequence is required"}), 400

        # Generate a random digit sequence
        generated_sequence = [random.randint(0, 9) for _ in range(sequence_length)]
        print(f"Generated sequence: {generated_sequence}")

        # Evaluate the user's input
        correct = user_sequence == generated_sequence

        return jsonify({
            "generated_sequence": generated_sequence,
            "user_sequence": user_sequence,
            "correct": correct
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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


# Preprocess words for prediction

from transformers import BertTokenizer
import numpy as np

# Load BertTokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def preprocess_word(word):
    # Tokenize using Hugging Face BertTokenizer
    tokens = tokenizer.encode(word, max_length=10, padding='max_length', truncation=True, return_tensors='tf')
    return np.array(tokens)

print(f"Tokenizer type: {type(tokenizer)}")
print(f"Sample word sequence: {tokenizer.texts_to_sequences(['test']) if hasattr(tokenizer, 'texts_to_sequences') else 'Not supported'}")


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

        print(f"Predicted Shape is {
              predicted_class} with confidence {confidence:.2f}")

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
        raise ValueError(
            "Invalid difficulty level. Use 'easy', 'medium', or 'hard'.")
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
    center = (np.random.randint(30, img_size - 30),
              np.random.randint(30, img_size - 30))
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


#
##
# READ _ IMAGE GENERATION*(Stable Diffusion)

# inizalize stable diffustion pipeline


def initialize_and_save_pipeline():
    print("Initializing the pipeline...")
    model_name = "CompVis/stable-diffusion-v1-4"

    # Load the pipeline
    pipe = DiffusionPipeline.from_pretrained(
        model_name, torch_dtype=torch.float16)
    pipe.to("cuda")  # Move to GPU for faster inference
    # pipe.to("cpu")  # Move to GPU for faster inference

    # Save the pipeline
    print("Saving the pipeline...")
    pipe.save_pretrained(PIPELINE_DIR)
    print("Pipeline saved!")
    return pipe

# load stable diffustion


def load_pipeline():
    if not os.path.exists(PIPELINE_DIR):
        print("Pipeline not found! Initializing and saving pipeline first.")
        return initialize_and_save_pipeline()

    print("Loading the pipeline...")
    pipe = DiffusionPipeline.from_pretrained(
        PIPELINE_DIR, torch_dtype=torch.float16)
    pipe.to("cuda")
    # pipe.to("cpu")  # Move to GPU for faster inference
    print("Pipeline loaded!")
    return pipe


pipe = load_pipeline()


@app.route("/read/gen/image", methods=["GET"])
def generate_image():
    try:
        body = request.get_json()

        prompt = body.get("prompt", "A beautiful landscape")
        save_path = body.get("save_path", "output_image.png")

        print(f"Generating image for prompt: {prompt}")
        # print(f"Generating image for prompt: {body.prompt}")

        # Generate the image
        image = pipe(prompt).images[0]

        # Display the image
        # image.show()

        # Save the image
        image.save(save_path)
        print(f"Image saved to: {save_path}")
        # return image
        return jsonify({"message": "Image generated successfully", "image_path": save_path}), 200
    except Exception as e:
        return jsonify({"message": "Image generated Faild", "error": e}), 500


def categorize_difficulty(word):
    syllables_count = syllapy.count(word)

    # Classify difficulty based on length and syllables
    if len(word) <= 4 and syllables_count <= 2:
        return 'Easy'
    elif len(word) <= 7 and syllables_count <= 3:
        return 'Medium'
    else:
        return 'Hard'


@app.route("/read/gen/word", methods=["GET"])
def random_word():
    body = request.get_json()
    difficulty_level = body.get(
        'difficulty', 'Easy')  # Default to Easy
    word_list = words.words()
    filtered_words = [word for word in word_list if categorize_difficulty(
        word) == difficulty_level]

    if filtered_words:
        return jsonify({"word": random.choice(filtered_words), "difficulty": difficulty_level})
    else:
        return jsonify({"error": "No words found for the selected difficulty level"}), 400


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



def generate_random_passage(num_sentences=5):
    # Get sentences from the Gutenberg corpus
    all_sentences = []
    for file_id in gutenberg.fileids():
        all_sentences.extend(sent_tokenize(gutenberg.raw(file_id)))

    # Pick random sentences to form a passage
    passage = " ".join(random.choices(all_sentences, k=num_sentences))
    return passage


def calculate_wpm(passage):
    # Count words in the passage
    word_count = len(passage.split())

    # Assign WPM based on word count (simplistic for demonstration)
    if word_count <= 50:
        avg_wpm = random.randint(100, 150)  # Easy
    elif word_count <= 100:
        avg_wpm = random.randint(150, 250)  # Medium
    else:
        avg_wpm = random.randint(250, 300)  # Hard

    return avg_wpm


@app.route('/read/gen/passage', methods=['GET'])
def generate_passage():
    data = request.get_json()
    num_sentences = data.get('num_sentences')
    print(num_sentences)
    passage = generate_random_passage(num_sentences)
    avg_wpm = calculate_wpm(passage)

    # Return JSON response
    return jsonify({
        "passage": passage,
        "average_wpm": avg_wpm
    }), 200


def getIncorrectWords():
    word_list = words.words()
    filtered_words = [word for word in word_list if categorize_difficulty(
        word) == 'Easy']
    return [random.choice(filtered_words), random.choice(filtered_words)]


@app.route('/read/gen/compAssment', methods=['GET'])
def getImagesList():
    try:
        body = request.get_json()
        incorrectwords = getIncorrectWords()
        filepath = "./uploads/read/assesments/comph/"
        worddisplayed = body.get("word", " a beautiful sun")

        correctimage = pipe("A beautiful ILLUSTRATIONS of " +
                            worddisplayed+"for childrens").images[0]
        correctimageurl = filepath+worddisplayed+".png"
        correctimage.save(correctimageurl)
        imagelist = [{
            "imagestatus": "correct",
            "path": correctimageurl,
            "word": worddisplayed
        }]

        for incorword in incorrectwords:
            incorimg = pipe(incorword).images[0]
            imageurl = filepath+incorword+".png"
            incorimg.save(imageurl)
            imagelist.append({
                "imagestatus": "incorrect",
                "path": imageurl,
                "word": incorword
            })

        return jsonify({
            "Images": imagelist,
        }), 200
    except Exception as e:
        return jsonify({
            "Images": "error occured",
            "error": e
        }), 404



@app.route("/generate-word", methods=["GET"])
def generate_word():
    try:
        random_level = random.choice(list(word_levels.keys()))
        random_word = random.choice(word_levels[random_level])

        # Set display time based on the level
        if random_level == "Level 1":
            display_time = 3  # Easy: 3 seconds
        elif random_level == "Level 2":
            display_time = 4  # Medium: 4 seconds
        elif random_level == "Level 3":
            display_time = 5  # Hard: 5 seconds
        elif random_level == "Level 4":
            display_time = 6  # Very hard: 6 seconds
        else:
            display_time = 3  # Default to 3 seconds if level is unknown

        # Display the word
        print(f"Generated word: {random_word}, Displaying for {display_time} seconds.")

        # Sleep for the duration of display time
        time.sleep(display_time)

        # Log when the display time ends
        print("Word display time end")

        return jsonify({
            "word": random_word,
            "true_level": random_level,
            "display_time": display_time
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
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

        # Optionally, you can add a query parameter `display_time` for how long to display the shape.
        display_time = int(request.args.get('display_time', 5))  # Default to 5 seconds if not specified.

        print(f"Generated Shape: {true_shape}")
        print(f"Predicted Shape: {predicted_class} with Confidence: {confidence:.2f}")

        # Return JSON response including Base64 image and the timestamp
        return jsonify({
            "true_shape": true_shape,
            "predicted_shape": predicted_class,
            "confidence": float(confidence),
            "image_base64": base64_image,
            "hide_after":  display_time  # The shape will be hidden after `display_time` seconds
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# Serve the digit sequence for the player to recall
@app.route("/generate-digit-sequence", methods=["GET"])
def generate_digit_sequence():
    try:
        # Generate a random sequence length between 2 and 6
        sequence_length = random.randint(2, 6)

        # Calculate display time based on sequence length (e.g., 2 seconds per digit)
        display_time = sequence_length * 2

        # Generate a random digit sequence of the calculated length
        digit_sequence = [random.randint(0, 9) for _ in range(sequence_length)]
        print(f"Generated digit sequence: {digit_sequence}")

        # Return the sequence and display time for the client to show
        return jsonify({
            "digit_sequence": digit_sequence,
            "sequence_length": sequence_length,
            "display_time": display_time
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
