const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');

const client = new SpeechClient({
    projectId:process.env.project_id,
    credentials:{
        client_email:process.env.client_email,
        private_key:process.env.private_key
    }
});

async function transcribeAudio(audioPath) {
    const audioBytes = fs.readFileSync(audioPath).toString('base64');
    const audio = {
        content: audioBytes,
    };

    const config = {
        encoding: 'LINEAR16',  // Specify the audio encoding (e.g., 'LINEAR16', 'MP3', 'FLAC')
        sampleRateHertz: 16000,  // Specify the sample rate (e.g., 16000 for phone-quality audio)
        languageCode: 'en-US',  // Specify the language (e.g., 'en-US' for English)
    };

    const request = {
        audio: audio,
        config: config,
    };

    try {
        client.recognize(request)
        .then(([response]) => {
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          console.log('Transcription: ', transcription);
          return transcription
        })
        .catch(err => {
          console.error('Error during transcription: ', err);
        });
    } catch (error) {
        console.error('Error transcribing audio: ', error);
        throw error
    }
}





// Test with an example audio file
// transcribeAudio('path/to/your/audio/file.wav');

module.exports = {
    transcribeAudio
}