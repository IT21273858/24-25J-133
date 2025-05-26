import torch
import torchaudio
from transformers import Wav2Vec2Processor,Wav2Vec2ForCTC

torchaudio.set_audio_backend("soundfile")

def getTranscribe(audiopath=""):
    print("Getting Transcripe")
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")
    model_vad, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad', model='silero_vad', trust_repo=True)
    (get_speech_timestamps, save_audio, read_audio, VADIterator, collect_chunks) = utils


    
    audio = read_audio(audiopath, sampling_rate=16000)
    speech_timestamps = get_speech_timestamps(audio, model_vad)
    speech_segments = collect_chunks(speech_timestamps, audio)


    inputs = processor(speech_segments, sampling_rate=16000, return_tensors="pt", padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0].lower()
    print("Transcription", transcription)
    return transcription

