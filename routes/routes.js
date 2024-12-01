const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const imagePredictionController = require('../src/controllers/imagePrediction')
const patternPredictionController = require('../src/controllers/patternPrediction')
const router = express.Router();

// Image Prediction Routes
router.post("/predict-shape", upload.single("image"), imagePredictionController.getShapePrediction);

// Pattern Prediction Route
router.post("/predict-pattern", patternPredictionController.getPatternPrediction);

module.exports = router;


