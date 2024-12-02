const express = require('express');
const multer = require('multer');
const router = express.Router();
const {transcribeAudio} = require('../src/controllers/read/speech-to-text')
const upload = multer({ dest: 'uploads/read/' });


// phonemes
router.get('/phonemes/get',async (req, res)=>{
    
        const phonemes = ["b", "ch", "sh", "th", "a", "e", "i", "o", "u"];
        const randomPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
        // const transcriptgenerated = await transcribeAudio(randomPhoneme);
        return res.json({ phoneme: randomPhoneme,transcript: a});
    
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

    const letterdisplayed = req.body.phoneme
    const existingTrans = req.body.transcript

    const transcriptgenerated = await transcribeAudio(audiopath);
    const normalizedTranscription = existingTrans.trim().toLowerCase();

    if (normalizedTranscription === normalizedTarget) {
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

    

})




// upload
router.post('/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is missing' });
    }
  
    const audioPath = req.file.path;
    res.json({ message: 'Audio received', path: audioPath });
  });


module.exports = router;
