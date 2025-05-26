import torch
from jiwer import wer
import torchaudio
import soundfile as sf
from transformers import Wav2Vec2Processor,Wav2Vec2ForCTC

def calculate_CPM(audiopath="",targetText=""):

    torchaudio.set_audio_backend("soundfile")

    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")
    model_vad, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad', model='silero_vad', trust_repo=True)
    (get_speech_timestamps, save_audio, read_audio, VADIterator, collect_chunks) = utils


    target_text = targetText
    audio = read_audio(audiopath, sampling_rate=16000)
    speech_timestamps = get_speech_timestamps(audio, model_vad)
    speech_segments = collect_chunks(speech_timestamps, audio)


    inputs = processor(speech_segments, sampling_rate=16000, return_tensors="pt", padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0].lower()
    print("Child’s reading:", transcription)
    # transcription = "Cat bathed yesterday"


    #compute WER ( accuracy )
    accuracy = 1 - wer(target_text.lower(), transcription.lower())
    print("Accuracy Score:", accuracy)


    #CPM_Normalization
    total_time_sec = (speech_timestamps[-1]['end'] - speech_timestamps[0]['start']) / 1000
    total_time_min = total_time_sec / 60

    num_chars = len(transcription.replace(" ", ""))
    cpm = num_chars / total_time_min


    words = target_text.split()

    avg_word_length = sum(len(word) for word in words) / len(words)
    print("Avg word length:", avg_word_length)

    cpm_normalized = cpm / avg_word_length
    print("CPM_normalized:", cpm_normalized)



    #smothness
    pause_durations = []
    for i in range(1, len(speech_timestamps)):
        pause = (speech_timestamps[i]['start'] - speech_timestamps[i-1]['end']) / 1000
        pause_durations.append(pause)

    avg_pause = sum(pause_durations) / len(pause_durations) if pause_durations else 0
    max_expected_pause = 2.0  # seconds (tweak as needed)

    smoothness = 1 - (avg_pause / max_expected_pause)
    smoothness = max(0, min(smoothness, 1.0))  # Clamp between 0-1
    print("pause_durations", pause_durations)
    print("Max expected pause:", max_expected_pause)
    print("Avg pause:", avg_pause)
    print("Smoothness Score:", smoothness)



    fluency_score = (0.5 * accuracy) + (0.3 * cpm_normalized) + (0.2 * smoothness)
    print("Final Fluency Score:", fluency_score)
    return {
        "fluency_score":fluency_score,
        "accuracy":accuracy,
        "cpm":cpm,
        "avg_word_length":avg_word_length,
        "cpm_normalized":cpm_normalized,
        "smoothness":smoothness,
        "transcription":transcription,
    }
