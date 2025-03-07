from tensorflow.keras.models import load_model
import sounddevice as sd
import soundfile as sf
import librosa
import numpy as np


# Load Model
model = load_model('./reading_component/fluency/model/fluency_model2.h5')

# Record User Audio


def record_audio(output_path, duration=5, sample_rate=16000):
    print("Recording...")
    audio = sd.rec(int(duration * sample_rate),
                   samplerate=sample_rate, channels=1, dtype='float32')
    sd.wait()
    sf.write(output_path, audio, sample_rate)
    print("Recording Complete!")


def extract_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=None)  # Load audio file
        mfccs = librosa.feature.mfcc(
            y=y, sr=sr, n_mfcc=13)  # Extract MFCC features
        return np.mean(mfccs.T, axis=0)  # Return averaged MFCC features
    except Exception as e:
        print(f"Error processing {audio_path}: {e}")
        return None


def predict_fluency(audio_path):
    print(audio_path)
    features = extract_features(audio_path)
    if features is None:
        return "Error processing audio file!"
    features = np.expand_dims(features, axis=0)
    prediction = model.predict(features)
    fluency_score = np.argmax(prediction)
    # print(f"Precication {prediction} ")
    return f"Predicted Fluency Level: {fluency_score}"


# Record and Evaluate
output_audio_path = "./reading_component/fluency/inputs/user_audio.wav"
record_audio(output_audio_path)
fluency_level = predict_fluency(output_audio_path)
print(fluency_level)
