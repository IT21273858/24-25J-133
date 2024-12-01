const patternPredictionService = require('../services/patternPrediction');

const getPatternPrediction = async (req, res) => {
    try {
        // Check if difficulty is provided in the request body
        const { difficulty } = req.body;
        if (!difficulty) {
            return res.status(400).json({
                status: false,
                message: "Difficulty level is required ('easy', 'medium', 'hard').",
            });
        }

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level. Use 'easy', 'medium', or 'hard'."})
            
        }

        // Call the pattern prediction service
        const predictionResult = await patternPredictionService.predictPattern(difficulty);

        // Handle the response
        if (predictionResult && predictionResult.success) {
            console.log("Pattern Prediction Result:", predictionResult.data);
            return res.status(200).json({
                status: true,
                patternPrediction: predictionResult.data,
                message: "Pattern prediction retrieved successfully.",
            });
        } else {
            console.error("Pattern Prediction Error:", predictionResult?.message || "Unknown error.");
            return res.status(400).json({
                status: false,
                message: predictionResult?.message || "Error retrieving pattern prediction.",
            });
        }
    } catch (error) {
        console.error("Error during pattern prediction:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during pattern prediction.",
            error: error.message || "Unknown error.",
        });
    }
};

module.exports = {
    getPatternPrediction,
};
