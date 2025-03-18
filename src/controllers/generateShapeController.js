const generateShapeService = require('../services/generateShapeService.js');

const getGenerateShape = async (req, res) => {
    console.log(res.body);
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
                message: "Invalid difficulty level. Use 'easy', 'medium', or 'hard'."
            })
        }

        // Call the shape generation service
        const shapeGeneration = await generateShapeService.GenerateShape(difficulty);

        // Handle the response
        if (shapeGeneration && shapeGeneration.success) {
            console.log("Shape Generation Result:", shapeGeneration.data);
            return res.status(200).json({
                status: true,
                patternPrediction: shapeGeneration.data,
                message: "Shape Generation retrieved successfully.",
            });
        } else {
            console.error("Shape Generation Error:", shapeGeneration?.message || "Unknown error.");
            return res.status(400).json({
                status: false,
                message: shapeGeneration?.message || "Error retrieving Shape Generation.",
            });
        }
    } catch (error) {
        console.error("Error during Shape Generation:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during Shape Generation.",
            error: error.message || "Unknown error.",
        });
    }
};

module.exports = {
    getGenerateShape,
};
