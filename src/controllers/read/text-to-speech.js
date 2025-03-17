const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');


const client = new textToSpeech.TextToSpeechClient({
    projectId:"",
    credentials:{
        client_email:"",
        private_key_id:"",
        private_key:""
    }
})

async function genSpeech(text) {
    // The text to synthesize
    const filepath = './uploads/read/games/spellword/output.mp3'; 
    // Construct the request
    const request = {
      input: {text: text},
      // Select the language and SSML voice gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      // select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };
  
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filepath, response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
    return filepath
  }


module.exports = {
    client,
    genSpeech
};