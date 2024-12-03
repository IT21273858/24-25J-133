const digitSpanService = require('../services//DigitSpanTask');

const getDigitSpanTask = async (req, res) => {
    try {
        // Extract parameters from the request
        const { sequenceLength = 5 } = req.query; // Default to a sequence length of 5 if not provided

        // Call the digit span service to generate a digit sequence
        const generationResult = await digitSpanService.generateDigitSequence(sequenceLength);

        console.log("Generated Digit Sequence:", generationResult);

        // Handle the response
        if (generationResult && generationResult.success) {
            const displayTime = generationResult.data.display_time;
            console.log(`Digit sequence will be displayed.`);

            // Log "Digit display time end" after display time
            setTimeout(() => {
                console.log("Digit display time end");
            }, displayTime * 1000);

            return res.status(200).json({
                status: true,
                digitSequence: generationResult.data,
                message: "Digit sequence generated successfully.",
            });
        } else {
            console.error(
                "Digit Sequence Generation Error:",
                generationResult?.message || "Unknown error."
            );
            return res.status(400).json({
                status: false,
                message: generationResult?.message || "Error generating digit sequence.",
            });
        }
    } catch (error) {
        console.error("Error during digit span task:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during digit span task.",
            error: error.message || "Unknown error.",
        });
    }
};

const validateDigitSpanTask = async (req, res) => {
    try {
        // Extract user's sequence and original sequence from the request
        const { userSequence = [], originalSequence = [] } = req.body;

        if (!Array.isArray(userSequence) || !Array.isArray(originalSequence)) {
            return res.status(400).json({
                status: false,
                message: "Both userSequence and originalSequence must be arrays.",
            });
        }

        console.log("User's Sequence:", userSequence);
        console.log("Original Sequence:", originalSequence);

        // Compare the sequences
        const isCorrect = JSON.stringify(userSequence) === JSON.stringify(originalSequence);

        return res.status(200).json({
            status: true,
            isCorrect,
            message: isCorrect
                ? "The user's sequence matches the original sequence!"
                : "The user's sequence does not match the original sequence.",
        });
    } catch (error) {
        console.error("Error during digit span task validation:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during digit span task validation.",
            error: error.message || "Unknown error.",
        });
    }
};

module.exports = {
    getDigitSpanTask,
    validateDigitSpanTask,
};
