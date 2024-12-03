const express = require('express');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const audioClient = require('../src/controllers/read/speech-to-text')
const upload = multer({ dest: 'uploads/read/assesments/spellword' });
const {getEncoder} = require('../src/utils/getAudioEncodingtype')


// phonemes(Spellword)
router.get('/phonemes/get',async (req, res)=>{
    
        const phonemes = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
        const randomPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
        // const transcriptgenerated = await transcribeAudio(randomPhoneme);
        return res.json({ phoneme: randomPhoneme,transcript: "a"});
    
});

router.get('/phonemes/verify',async (req, res) =>{
    if(!req.body){
        return res.json({
            error: "no body added"
        })
    }

    const audiopath = req.body.audiopath;
    if(!audiopath){
        return res.json({
            error: "no audio path provided"
        })
    }

    const letterdisplayed = req.body.worddisplayed

    const audioBytes = fs.readFileSync(audiopath).toString('base64');
    const encodeInfo = getEncoder(req.body.audioMeme)

    if(!encodeInfo){
        return res.status(404).json({
            error:"Can not find the encorder type",
            encordertype:req.body.audioMeme
        })
    }

    const audio = {
        content: audioBytes,
    };

    const config = {
        encoding: encodeInfo.encoding,  // Specify the audio encoding (e.g., 'LINEAR16', 'MP3', 'FLAC')
        sampleRateHertz: encodeInfo.sampleRateHertz,  // Specify the sample rate (e.g., 16000 for phone-quality audio)
        languageCode: 'en-US',  // Specify the language (e.g., 'en-US' for English)
    };

    const request = {
        audio: audio,
        config: config,
    };

    try {
        
        audioClient.recognize(request)
        .then(([response]) => {
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          if(transcription){
            const transcriptgenerated = transcription;
            const letterdisplayed = letterdisplayed.trim().toLowerCase();
            if (letterdisplayed == transcriptgenerated) {
                return res.status(200).json({
                    msg : "Verified",
                    status :true
                });
            } else {
                return res.status(200).json({
                    msg : "Not Verified",
                    status :false
            });
            }

          }
          return transcription
        })
        .catch(err => {
          console.error('Error during transcription: ', err);
          return res.status(200).json({
            msg : "Error during transcription",
            status :false,
            err
    });

        });
    } catch (error) {
        console.error('Error transcribing audio: ', error);
        throw error
    }








    

    

})

//Fluency (count the word)
router.get('/fluency/getpassage',async (req, res)=>{
    
    const passages = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
    const randomPassages = phonemes[Math.floor(Math.random() * phonemes.length)];
    const wordcount = randomPassages.split(" ").length;
    // const transcriptgenerated = await transcribeAudio(randomPhoneme);
    return res.json({ passage: randomPhoneme,wordcount: wordcount, avarageWPM :randomPassages});

});

router.get('/fluency/calcWPM',async (req, res) =>{
    var fluencylevel = "none"
if(!req.body){
    return res.json({
        error: "no body added"
    })
}

//body
const wordsDisplayed = req.body.wordsDisplayed
const audiopath = req.body.audiopath;
const timetaken = req.body.timetaken; // in minutes
const AverageWPM = req.body.AverageWPM;
// audioMeme

if(!audiopath){
    return res.json({
        error: "no audio path provided"
    })
}



const audioBytes = fs.readFileSync(audiopath).toString('base64');
const encodeInfo = getEncoder(req.body.audioMeme)

if(!encodeInfo){
    return res.status(404).json({
        error:"Can not find the encorder type",
        encordertype:req.body.audioMeme
    })
}

const audio = {
    content: audioBytes,
};

const config = {
    encoding: encodeInfo.encoding,  // Specify the audio encoding (e.g., 'LINEAR16', 'MP3', 'FLAC')
    sampleRateHertz: encodeInfo.sampleRateHertz,  // Specify the sample rate (e.g., 16000 for phone-quality audio)
    languageCode: 'en-US',  // Specify the language (e.g., 'en-US' for English)
};

const request = {
    audio: audio,
    config: config,
};

try {
    
    audioClient.recognize(request)
    .then(([response]) => {
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      if(transcription){
        const wordsRead = transcription.split("").length;
        const WPM = wordsRead/timetaken;
        // console.log(AverageWPM)
        const Fluencylevel = WPM/AverageWPM

        if(Fluencylevel>1.5){
            fluencylevel = "HIGH"

        }else if(Fluencylevel < 0.7){ 
            fluencylevel = "LOW"
        }else{
            fluencylevel = "NORMAL" // beteen 0.7 and 1.5
        }

        return res.status(200).json({
            wordsread:wordsRead,
            wpm : WPM,
            fluency:Fluencylevel,
            fluencylevel :fluencylevel

        });

        

      }
     
    })
    .catch(err => {
      console.error('Error during transcription: ', err);
      return res.status(404).json({
        msg : "Error during transcription",
        status :false,
        err:err
});

    });
} catch (error) {
    console.error('Error transcribing audio: ', error);
    throw error
}












})





// upload
router.post('/upload-audio', upload.single('audio'),async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is missing' });
    }

    const fileconfig={
        "mimetype":req.file.mimetype,
        "originalname":req.file.originalname,
        "stream":req.file.stream,
        "path":req.file.path,
        "size":req.file.size,
    }
  

   try {
    res.json({ message: 'Audio received', file: fileconfig });
   } catch (error) {
    console.log("encode error")
    console.log(error)
   }

   
});


//genimage


module.exports = router;
