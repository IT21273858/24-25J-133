const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');


const createClient = () => {
    return new SpeechClient({
        projectId:"jeevanspaces",
        credentials:{
            client_email:"speechtextuser-rp@jeevanspaces.iam.gserviceaccount.com",
            private_key_id:"c94bf0848ecdf675900e12d821a7c3f2e7e0ea3b",
            private_key:"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5Ief7iqMdB1Ug\nLcc9tWafxL/WuAUcPeA/k2gj8oxKLr4wz+EQixtVLSQMtXzmhQo9DaJgV+0EqGsE\n0QLrtpCD09HeSHwJyPuumC9F7kLfD+HLLvqtqasdnxIZ5g3QsDanjiuZQWJ3FmZP\ndJKKX9rQDpSw6gTesxy/6L1VxOjKPR6v03dEnq7SEMa7IoOgYnLGggvmRI5ifCVg\nT2PjNnqQjtaSCVPDZjQ7TTIkEpkyNCkRm1c8dFQyJhYRWLSnA5gx9DaIGBgnvLJe\ntyZJOKXn08iWeCbaUw7zXOknmWHYxsFITdW8ELPecm2Ad4d49FYdJhl4GOnEUCg0\nxxAVRwAjAgMBAAECggEAIpD6nARILVjbo4z4mQSAO0+ElCY6ygmhj61JsgCNAiLV\nHw8JUknu2gn6I6dVQUNQ5JJhoYR5PDfn93fBCFrHg92uX0cAZeFRYMmIdhGlCboQ\n6huE8Zzu1rKHMi+6n57vLXzFljFXna2gf7Bf1hdMpzE5wQiIzT37HbfqdhO0dWH/\nBdQhIW6sfvIBja3Vv10tajS1QqUhmglca160s/EYIDynTfI7WsekREjXIdOu/Cgg\n3Q1oY5gL09YfypUD5sg4BDzs914e35/pYWsGCdTB0rmarIT24RyjKqUQxAIYSsMw\nIuUKUM/6NUqN3boGLDxo4+2vIyX5FYxU3KpxxUVLeQKBgQD5gDdDk778dSHzpQHy\n8RT8CJMuyYy37OCRsxeYbAMiDLejd3N+C2YxA51Z/KSsWRHIYQiOKcJjzr4xOQqx\n3gdch3F8VrBWw5ifSxB6FDoWEuVnk6D6nsJ8HF/Lyo78UkLaBAJGLb8xAZGg8vcT\nPZ6+6lRiP1hKQ4SNjFtONi6nGQKBgQC99HPrWu8zYWOYYNFMBz7i8qbFRpgC/yoH\natU7/yZKJVL3rPVamSxKed5HwPDybU4UzjEd7bqfdTM+VzninOGa1i86Ln7WM9QN\nMOk+iBjQgmuSifzFHISBvc4w1DL8zuxdN70lostACRQoJkefy1pWSLN2aXGcJ8Hb\nWIG3GmT0mwKBgQDr6eBXdYxRCjBgQNXm8S32YeVJiCoWf1SYb88PwJH10DCT0I7T\nz9OA5PoT7F+I12+JGLcONU4pMYOE53rFVDuBslAMUavLXochl8isphOGa7eeiGje\nkN80m1+5Qn6Q9vdfTgsYcIknvWQF27bj6o//1XKUs3C4R78+WEi9W14hgQKBgEGp\nRICwmErMeV7s6Kw9PPG6Kwe6VUWD6oVR2o+4rQWoTTusH8vHctXztnBbM265deof\nND9CM+Z23tXH1QyOajXZn82e0N0+YSiGJbol1V4OFx06cZO5PdyTPbkHQPC+nlnC\nsLFXyqZB/SO7x7pm0r1MuCxQWqM94vbtazld+FPNAoGAFl+yfjjPDfzduZcMy6xc\n+TCtv+WCgvbQC0AP8dh9cnty/2psmDlDs6D2d2bgCjOhU/+nY8JXUJPp5w8IN+Pg\na8qHc6usNwapPTlTMXgSpuELPewVQCis4O3HhRFfyfrE9M0f0Xla+CWhCma0SUXd\nQwsXVSwYRV9XL26h9zBNC50=\n-----END PRIVATE KEY-----\n"
        }
    });
  };





module.exports = {createClient};



// Test with an example audio file
// transcribeAudio('path/to/your/audio/file.wav');

