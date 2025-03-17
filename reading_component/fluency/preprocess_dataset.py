import librosa
import numpy as np
import os
import pickle

# Path to the dev-clean folder containing subfolders of audio files
dataset_path = './datasets/reading/dev-clean/LibriSpeech/dev-clean'

# Step 1: Extract MFCC Features from Audio


def extract_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=None)  # Load audio file
        mfccs = librosa.feature.mfcc(
            y=y, sr=sr, n_mfcc=13)  # Extract MFCC features
        return np.mean(mfccs.T, axis=0)  # Return averaged MFCC features
    except Exception as e:
        print(f"Error processing {audio_path}: {e}")
        return None

# Step 2: Load Data (Unlimited Files)


def load_data(dataset_path, limit=None):
    audio_features = []
    labels = []
    file_count = 0

    if not os.path.exists(dataset_path):
        print(f"Error: The dataset path '{dataset_path}' does not exist.")

    # Iterate through the dataset path recursively to find folders with .flac files
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith('.trans.txt'):
                transcription_path = os.path.join(root, file)

                # Read the transcription file
                with open(transcription_path, 'r') as f:
                    transcriptions = f.readlines()

                for transcription in transcriptions:
                    parts = transcription.strip().split(' ', 1)

                    if len(parts) == 2:
                        identifier, text = parts
                        audio_filename = f'{identifier}.flac'
                        audio_path = os.path.join(root, audio_filename)

                        # Normalize the path
                        audio_path = os.path.normpath(audio_path)

                        # Check if the .flac file exists
                        if os.path.exists(audio_path):
                            features = extract_features(audio_path)
                            if features is not None:
                                audio_features.append(features)
                                labels.append(text)
                                file_count += 1

                                # Stop when the limit is reached
                                if limit is not None and file_count >= limit:
                                    print(f"Reached the limit of {
                                          limit} files.")
                                    return np.array(audio_features), labels
                        else:
                            print(f"Audio file does not exist: {
                                  audio_filename}")

    return np.array(audio_features), labels


# Load and Process Entire Dataset
X, y = load_data(dataset_path, limit=None)  # No limit

# Check if data is loaded properly
print(f"Shape of X: {X.shape}")
print(f"Length of y: {len(y)}")

# Save Processed Data for Future Use
if len(X) > 0 and len(y) > 0:
    with open('./reading_component/fluency/preprocessed/processed_data2.pkl', 'wb') as f:
        pickle.dump((X, y), f)
    print("Data Loaded and Processed! Total Samples:", len(X))
else:
    print("No data was processed.")
