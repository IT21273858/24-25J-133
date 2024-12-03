const ffmpeg = require('fluent-ffmpeg');

function convertToWav(inputFilePath, outputFilePath) {
    ffmpeg(inputFilePath)
      .toFormat('wav')
      .on('end', () => {
        console.log('Conversion finished:', outputFilePath);
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err.message);
      })
      .save(outputFilePath);
}