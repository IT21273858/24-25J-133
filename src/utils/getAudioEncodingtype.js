

function getEncoder(filememe){
    const encodingMap = {
        'audio/mpeg': { encoding: 'MP3', sampleRateHertz: 44100 },
        'audio/wav': { encoding: 'LINEAR16', sampleRateHertz: 16000 },
        'audio/wave': { encoding: 'MULAW', sampleRateHertz: 8000 },
        'audio/ogg': { encoding: 'OGG_OPUS', sampleRateHertz: 48000 },
        'audio/flac': { encoding: 'FLAC', sampleRateHertz: 44100 },
      };

      return encodingMap[filememe] || 'audio/wav'
    
}



module.exports = {
    getEncoder
}