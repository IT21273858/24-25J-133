const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const imagePredictionController = require('../src/controllers/imagePrediction')
const patternPredictionController = require('../src/controllers/patternPrediction')
const ParentController = require('../src/controllers/parentController')
const router = express.Router();

// Image Prediction Routes
router.post("/predict-shape", upload.single("image"), imagePredictionController.getShapePrediction);

// Pattern Prediction Route
router.post("/predict-pattern", patternPredictionController.getPatternPrediction);

// Parent Route
router.get('/parents/getAll', ParentController.getAllParents);
router.get('/parents/get/:id', ParentController.getParentById);
router.post('/parents/create', ParentController.createParent);
router.patch('/parents/update/:id', ParentController.updateParent);
router.delete('/parents/delete/:id', ParentController.deleteParent);
router.post('/parents/login', ParentController.login);
router.post('/parents/forgot', ParentController.forgotParent);
router.post('/parents/verifyotp', ParentController.verifyotp);

module.exports = router;


