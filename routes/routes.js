const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const imagePredictionController = require('../src/controllers/imagePrediction')
const patternPredictionController = require('../src/controllers/patternPrediction')
const ParentController = require('../src/controllers/parentController')
const ChildrenController = require('../src/controllers/childrenController')
const GameController = require('../src/controllers/gameController')
const GameScoreController = require('../src/controllers/gameScoreController')
const GenerateShapeController = require('../src/controllers/generateShapeController')
const router = express.Router();

// Image Prediction Routes
router.post("/predict-shape", upload.single("image"), imagePredictionController.getShapePrediction);

// Pattern Prediction Route
router.post("/predict-pattern", patternPredictionController.getPatternPrediction);

// Generate Shape Route
router.post("/generate-shapes", GenerateShapeController.getGenerateShape);

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
router.get('/games/getassigned-game/:id', GameController.getAssignedGame);
router.post('/games/verify-gamecompletion', GameController.verifyGameCompletion)
router.post('/games/execute-game/:id', upload.single("image"), GameController.executeGame)

// GameScore Route
router.get('/gamescore/getAll', GameScoreController.getAllGameScores);
router.get('/gamescore/get/:id', GameScoreController.getGameScoreById);
router.get('/gamescore/getbychildren/:id', GameScoreController.getGameScoreByChildrenId);
router.post('/gamescore/create', GameScoreController.createGameScore);
router.patch('/gamescore/update/:id', GameScoreController.updateGameScore);
router.delete('/gamescore/delete/:id', GameScoreController.deleteGameScore);


module.exports = router;


