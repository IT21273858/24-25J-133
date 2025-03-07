var express = require('express');
var app = express();
require('dotenv').config();
var routes = require('./routes/routes');
var readRoutes = require('./routes/routesRead')
const cors = require('cors');
const { connectToDatabase } = require('./src/utils/db');
const PORT = process.env.PORT|| 8080;
const origins = process.env.Origins
const bodyParser = require('body-parser');

// **Configure CORS with Security Considerations**
const allowedOrigins = [
  origins,
  "https://i.pinimg.com"
];
app.use(bodyParser.json());
const corsOptions = {
  origin: function (origin, callback) {
    console.log("Request incoming to backend by...........", origin);
    if ((!origin || allowedOrigins.indexOf(origin) !== -1) || origin!=undefined) {
      callback(null, true);
    } else {
      callback(new Error('Request not allowed by Dyslexia Team. You are not authorized to perform this action'));
    }
  },
  credentials: true, // Include credentials for cookies, authorization headers, etc.
  optionsSuccessStatus: 200 // Optionally set to return a 200 status for OPTIONS requests
};

app.use(cors(corsOptions));
app.use('/read',readRoutes)
app.use(routes);

const startServer = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();


