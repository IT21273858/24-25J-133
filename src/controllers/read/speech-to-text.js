const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');

const client = new SpeechClient({
    projectId:"inhouse-430306",
    credentials:{
        client_email:"rpserviceuser@inhouse-430306.iam.gserviceaccount.com",
        private_key_id:"bd680a9cd9bc3054307d268ad140be601d266786",
        private_key:"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNiQ/Ah4632CP3\nEuZpKlxK56hSBf+Y/Z9KOxuNRTnxOffmvDJv4Yu4vhZyd94RQmQL2me12NYnJRQn\nkP71tKtBDgAv7SwHt29V7U0eLoUrOZYjdEaiaOtK/L9kwp4DWm1cnuIbwDfLkmyu\nghMTSki0Cur9Lc6yTPIs1eHuVtf7Vb5rCRqau3Y8oE/bmCoV8QABO8VvUAxtlfgi\nCyIXrTMFI1ZXnLbvLPrBY9B/tJdYBWU6pcJnHMNf5V8lI9CC4sxWA4kqe7N0FSBh\nwiy9xxbOQsUh53Y4a9XFbQRY7R6J6YqQNYl1mvZuNl1FrYFKOwtAbpb395XV87rO\n6UlluOOFAgMBAAECggEAAcLamSn7n1Ub/nM8NhKxdLALpBjzm7afM6P5zZ3QCRYz\nQDOE1yq/XLudGV1CaMhU4zNZ/40mX5EKx+szufr9Xodw+v4+8ajjQd97OodxKPxQ\nA6Mdb8fM6reWKQ/5OrbRFjKMqS2eMht3Ga0UiQZ1RM8Zka34B4WvPfo6Se6pQf7f\n4AoquZX/hkSqwtKE0J2fiEIR+0RdXf8BEFmLF29w+BEFivseK7cnN8GZFn6Cr/Ci\nx4j0Zrzjd37L4CBXbwTyYa5iPgs5bO2+lWGH2UrR558N1DH3kE7o9T7JsmLBbI66\nw16nSzwfbEJvrX5EdqJ7ZPD6dDw06lb1/IPMMu7/uQKBgQD3eGDfNQ/CjUbJku1j\n+f2b8j53xSh+ofLlIafiUFoJ5RHbfbM9+shS5y7szWlIlXOCfINcXhAiSklwJPzE\n82KyTwUMpNqMncWa0lFTjMAwISge0lNILLo7aB3K6t5EeBvBoghI2D14o+bzEQrK\ncsw8qhdeSwvQCFdCnftFKl4qDQKBgQDUnqjcPNxQ56p2FsMyvbdgRTPYPMx5tU24\n+/m4MXPPX9ctCWxXkqPH+Rg2njJCrMH6XshdkXTow4TO3p90h3PItEHHY4ZVk2jj\nPqqn5ZWbr0cFtqwODW56pgSJTsP8QMPHGByXu2NCTFd8hB+o2KmbWk4NzrUII4NN\nVXXHuSUZWQKBgQCc75k3U/YXofJHOMcVBN9g+yHEYKLKk7duuYY3Dk/bQIqvkCqQ\nXq6VbIikoatn3WcwU/gWJozCwiuKU9p8qABqJZSFLTJvxEohYckzW+oxW4WO7kDk\nX4EG1YM3QPUNpMGtbS0lzQRGsmJuuNsIAf8lZZSGNr9aAUAdPgSwGys2LQKBgCgT\nk96XdiulzyKdHcP1sJfr017h7uTOAM1qaWKHp72h4gwyJ4LGOCrcT+0TmoOozpNj\nxD6myTOKjwDzQ3kSgweEupVbtBlzRKT4zfABvVZwDmIMUZgAfh+OJXLALv7gMkbX\ny6PqBUac3yywNst7s1R+DBJcMRFMqFYuUpoH0u9ZAoGBAJSPmjzj/3adOlbBkPyI\nA+z/ohwmDXnBiQbhZ3mGi+MrfmekhirEMrxRdbUG5bhUqTcjfwb+eMFvb3T+40aD\n+IBzkFD/YK1RFNh/cnFCA49GaGwWSAkgLh5ohhc8jDg4DmTdYN7C507k4gdEJ8vg\nUhqL1TCsnW0X/0HE0PaBSlBC\n-----END PRIVATE KEY-----\n"
    }
});



module.exports = client;



// Test with an example audio file
// transcribeAudio('path/to/your/audio/file.wav');

