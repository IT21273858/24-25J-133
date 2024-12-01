const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

// Route for predicting pattern and next shape
app.post('/predict', (req, res) => {
    const { difficulty } = req.body;

    if (!difficulty) {
        return res.status(400).json({ error: "Difficulty level is required (easy, medium, hard)." });
    }

    // Spawn the Python process
    const python = spawn('python', ['pattern_predictor.py', difficulty]);

    let output = '';
    let errorOutput = '';

    // Capture Python output
    python.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Capture Python errors
    python.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // On process close, send the result
    python.on('close', (code) => {
        if (code === 0) {
            res.json(JSON.parse(output));
        } else {
            res.status(500).json({ error: errorOutput });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
