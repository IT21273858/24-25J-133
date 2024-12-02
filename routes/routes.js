const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const imagePredictionController = require('../src/controllers/imagePrediction')
const patternPredictionController = require('../src/controllers/patternPrediction')
const ParentController = require('../src/controllers/parentController')
const identifyShapeController = require('../src/controllers/identifyShape')
const predictWordController = require('../src/controllers/predictWord')
const ChildrenController = require('../src/controllers/childrenController')
const GameController = require('../src/controllers/gameController')
const router = express.Router();

// Image Prediction Routes
router.post("/predict-shape", upload.single("image"), imagePredictionController.getShapePrediction);

// Pattern Prediction Route
router.post("/predict-pattern", patternPredictionController.getPatternPrediction);

//Identify Shape Route
router.post("/identify-shape", identifyShapeController.getIdentifyShape);

// Identify generate a word 
router.get('/generate-word', predictWordController.getGenerateWord);

// Parent Route
router.get('/parents/getAll', ParentController.getAllParents);
router.get('/parents/get/:id', ParentController.getParentById);
router.post('/parents/create', ParentController.createParent);
router.patch('/parents/update/:id', ParentController.updateParent);
router.delete('/parents/delete/:id', ParentController.deleteParent);
router.post('/parents/login', ParentController.login);
router.post('/parents/forgot', ParentController.forgotParent);
router.post('/parents/verifyotp', ParentController.verifyotp);

// Child Route
router.get('/childrens/getAll', ChildrenController.getAllChildrens);
router.get('/childrens/get/:id', ChildrenController.getChildById);
router.post('/childrens/create', ChildrenController.createChild);
router.patch('/childrens/update/:id', ChildrenController.updateChild);
router.delete('/childrens/delete/:id', ChildrenController.deleteChild);
router.post('/childrens/login', ChildrenController.login);
router.post('/childrens/forgot', ChildrenController.forgotChild);
router.post('/childrens/verifyotp', ChildrenController.verifyotp);

// Game Route
router.get('/games/getAll', GameController.getAllGames);
router.get('/games/get/:id', GameController.getGameById);
router.post('/games/create', GameController.createGame);
router.patch('/games/update/:id', GameController.updateGame);
router.delete('/games/delete/:id', GameController.deleteGame);
router.post('/games/assign-game', GameController.assignGameToChild);
router.get('/games/getassigned-game/:id',GameController.getAssignedGame);
router.post('/games/verify-gamecompletion',GameController.verifyGameCompletion)


module.exports = router;


