const imagePredictionService = require('../services/imagePrediction');

const getShapePrediction = async (req, res) => {
    try {
        // Check if an image file is provided in the request
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "No image file uploaded. Please include an image for prediction.",
            });
        }

        // Call the prediction service
        const predictionResult = await imagePredictionService.predictShape(req);

        // Handle the response
        if (predictionResult && predictionResult.success) {
            console.log("Prediction Result:", predictionResult.data);
            return res.status(200).json({
                status: true,
                prediction: predictionResult.data,
                message: "Prediction retrieved successfully.",
            });
        } else {
            console.error("Prediction Error:", predictionResult?.message || "Unknown error.");
            return res.status(400).json({
                status: false,
                message: predictionResult?.message || "Error retrieving prediction.",
            });
        }
    } catch (error) {
        console.error("Error during prediction:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during prediction.",
            error: error.message || "Unknown error.",
        });
    }
};

module.exports = {
    getShapePrediction,
};
