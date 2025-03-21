const express = require('express');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const {createClient} = require('../src/controllers/read/speech-to-text')
const {genSpeech} = require('../src/controllers/read/text-to-speech')
const upload = multer({ dest: 'uploads/read/assesments/spellword' });
const {getEncoder} = require('../src/utils/getAudioEncodingtype');
const { getScoreByDifficulty } = require('../src/utils/getScorebyDifficulty');
const {createAssesmenttoReader} = require('../src/services/read/assesment')



//Checkpoints

// phonemes(Spellword)
router.get('/phonemes/get',async (req, res)=>{
    
        const phonemes = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
        const randomPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
        // const transcriptgenerated = await transcribeAudio(randomPhoneme);
        return res.json({ phoneme: randomPhoneme,transcript: "a"});
    
});

router.post('/phonemes/verify',async (req, res) =>{
    if(!req.body){
        return res.json({
            error: "no body added"
        })
    }

    console.log("started recognize")


    const audiopath = req.body.audiopath;
    if(!audiopath){
        return res.json({
            error: "no audio path provided"
        })
    }

    const letterdisplayed = req.body.worddisplayed
    const wordDifficulty = req.body.difficulty
    const readersId = req.body.readersId

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

        const audioClient = createClient()

        audioClient.recognize(request)
        .then(async ([response]) => {
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        
            
          if(transcription){
            const transcriptgenerated = transcription.trim().toLowerCase();
            const letterdisplay = letterdisplayed.trim().toLowerCase();
            console.log("display " +letterdisplay)
            console.log("Recognized " +transcriptgenerated)
            if (letterdisplay == transcriptgenerated) {

                //verified

                //create assesment
                const data = {
                    Score : getScoreByDifficulty(wordDifficulty),
                    wordgiven : letterdisplayed,
                    checkmeasure : "Pronounce",
                    difficulty : wordDifficulty,
                    readersId : readersId
                }

                const assesment = await createAssesmenttoReader(data)



                return res.status(200).json({
                    msg : "Verified",
                    status :true,
                    pronounced : transcription,
                    worddisplayed:letterdisplay,
                    dbstatus:assesment?"Recorderd":"Not Recorded"
                });
            } else {
                const data = {
                    Score : 0,
                    wordgiven : letterdisplayed,
                    checkmeasure : "Pronounce",
                    difficulty : wordDifficulty,
                    readersId : readersId
                }

                const assesment = await createAssesmenttoReader(data)


                return res.status(200).json({
                    msg : "Not Verified",
                    status :false,
                    pronounced : transcription,
                    worddisplayed:letterdisplay,
                    dbstatus:assesment?"Recorderd":"Not Recorded"
            });
            }

          }
        })
        .catch(async (err) => {
          console.error('Error during transcription: ', err);
          
          return res.status(404).json({
            msg : "Error during transcription",
            status :false,
            error:err
    });

        }).finally(async ()=>{
            await audioClient.close();
        })
    } catch (error) {
        console.error('Error transcribing audio: ', error);
        throw error
    }finally{
       
    }








    

    

})

//Fluency (count the word)
router.get('/fluency/getpassage',async (req, res)=>{
    
    const passages = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
    const randomPassages = passages[Math.floor(Math.random() * passages.length)];
    const wordcount = randomPassages.split(" ").length;
    // const transcriptgenerated = await transcribeAudio(randomPhoneme);
    return res.json({ passage: randomPassages,wordcount: wordcount, avarageWPM :randomPassages});

});

router.post('/fluency/calcWPM',async (req, res) =>{
    var fluencylevel = "none"
if(!req.body){
    return res.json({
        error: "no body added"
    })
}

//body
const wordsDisplayed = req.body.wordsDisplayed
const audiopath = req.body.audiopath;
const timetaken = req.body.TTT; // in minutes
const AverageWPM = req.body.AverageWPM;
const readersId = req.body.readersId;
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
    
    const audioClient = createClient()

    audioClient.recognize(request)
    .then(async ([response]) => {
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      if(transcription){
        const wordsRead = transcription.split(" ").length;
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

        data ={
            Score:Fluencylevel,
            wordgiven : wordsDisplayed,
            wpm :WPM,
            checkmeasure : "Fluency",
            difficulty : "none",
            readersId : readersId
        }

        const assesment = await createAssesmenttoReader(data)

        

        return res.status(200).json({
            wordsread:wordsRead,
            wpm : WPM,
            fluency:Fluencylevel,
            fluencylevel :fluencylevel,
            dbstatus : assesment?"Recorded":"NotRecorded"

        });

        

      }
     
    })
    .catch(async (err) => {
      console.error('Error during transcription: ', err);
      
      return res.status(404).json({
        msg : "Error during transcription",
        status :false,
        err:err
});

    }).finally(async()=>{
        await audioClient.close()
    })
} catch (error) {
    console.error('Error transcribing audio: ', error);
    throw error
}












})


//Comprehen
router.get('/comp/savescroe',async (req, res) =>{
    
if(!req.body){
    return res.json({
        error: "no body added"
    })
}

//body
const wordsDisplayed = req.body.wordsDisplayed
const timetaken = req.body.TTT; // in minutes
const score = req.body.score;
const readersId = req.body.readersId;
// audioMeme
try {
    
        data ={
            Score:score,
            wordgiven : wordsDisplayed,
            checkmeasure : "Comp",
            difficulty : "none",
            readersId : readersId
        }

        const assesment = await createAssesmenttoReader(data)



        return res.status(200).json({
            wordsDisplayed:wordsDisplayed,
            timetakentograb:timetaken,
            dbstatus : assesment?"Recorded":"NotRecorded"
        });

        

    }
     
    

    
catch (error) {
    console.error('Error transcribing audio: ', error);
    throw error
}
})




//Games


//spellword
router.post('/phonemes/genvoice',async (req, res)=>{
    
    if(!req.body.word){
        return res.status(404).json({
            error:"No txt found"
        })
    }

    // const phonemes = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
    const audiopath = await genSpeech(req.body.word);

    
    // const transcriptgenerated = await transcribeAudio(randomPhoneme);
    return res.status(200).json({ word: req.body.word,audio: audiopath});

});















//comprehension



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
