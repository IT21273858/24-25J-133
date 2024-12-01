const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const imagePredictionController = require('../src/controllers/imagePrediction')
const router = express.Router();

// Image Prediction Routes
router.post("/predict-shape", upload.single("image"), imagePredictionController.getShapePrediction);

module.exports = router;


