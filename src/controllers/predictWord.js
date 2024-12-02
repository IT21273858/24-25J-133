
const generateWordService = require('../services/predictWord');


const getGenerateWord = async (req, res) => {
    try {
        // Call the generate word service to generate a word
        const generationResult = await generateWordService.generateWord();
        console.log(generationResult);

        // Handle the response
        if (generationResult && generationResult.success) {
            console.log("Word Generation Result:", generationResult.data);

            // Display word for the given time
            const displayTime = generationResult.data.display_time;
            console.log(`Word: ${generationResult.data.word} will be displayed for ${displayTime} seconds.`);

            // Log "Word display time end" after display time
            setTimeout(() => {
                console.log("Word display time end");
            }, displayTime * 1000);

            return res.status(200).json({
                status: true,
                generatedWord: generationResult.data,
                message: "Word generated successfully.",
            });
        } else {
            console.error("Word Generation Error:", generationResult?.message || "Unknown error.");
            return res.status(400).json({
                status: false,
                message: generationResult?.message || "Error generating word.",
            });
        }
    } catch (error) {
        console.error("Error during word generation:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during word generation.",
            error: error.message || "Unknown error.",
        });
    }
};


module.exports = {
    getGenerateWord,
    
};
