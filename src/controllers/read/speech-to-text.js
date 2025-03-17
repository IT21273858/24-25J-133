const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');

const client = new SpeechClient({
    projectId:"",
    credentials:{
        client_email:"",
        private_key_id:"",
        private_key:""
    }
});



module.exports = client;



// Test with an example audio file
// transcribeAudio('path/to/your/audio/file.wav');

