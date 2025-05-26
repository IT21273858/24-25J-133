const generateShapeService = require('../services/generateShapeService.js');
const ganShapeService = require('../services/ganShapeService');
const newShapeService = require('../services/ganShapeService.js');

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


const getGenerateGANShape = async (req, res) => {
    const { label } = req.body;

    const result = await ganShapeService.generateGANShape(label);
    if (result.success) {
        res.status(200).json({
            success: true,
            image_base64: result.data.image_base64,
            message: `GAN shape (${label}) generated successfully.`,
        });
    } else {
        res.status(400).json({
            success: false,
            message: result.message,
        });
    }
};


const predictNewShape = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded. Please provide an image.",
      });
    }

    const result = await newShapeService.predictNewShape(req.file.path);

    if (result.success) {
      res.status(200).json({
        success: true,
        prediction: result.prediction,
        confidence: result.confidence,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in predictNewShape:", error.message);
    res.status(500).json({
      success: false,
      message: "Error predicting shape.",
      error: error.message,
    });
  }
};



const getGANShape = async (req, res) => {
  try {
    const { shape } = req.body;
    if (!shape) {
      return res.status(400).json({ success: false, message: "Shape name is required." });
    }

    const result = await ganShapeService.getGANShape(shape);
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in getGANShape controller:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




module.exports = {
    getGenerateShape,getGenerateGANShape,predictNewShape,getGANShape
};
