console.log("using farm app")
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

console.log("loading coreAuth")
const coreAuthRouter = require('./routes/coreRoutes/coreAuth');

console.log("loading coreApi")
const coreApiRouter = require('./routes/coreRoutes/coreApi');

const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const app = express();

console.log("loading router")

// CORS configuration with credentials
const allowedOrigins = ['http://localhost:3000', 'https://your-production-domain.com']; // Define allowed origins
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, etc.)
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// API Routes
app.use('/api', coreAuthRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/public', corePublicRouter);

// Add /api/home route
app.get('/api/home', (req, res) => {
  res.send('Hello World');
});

// 404 handler
app.use(errorHandlers.notFound);
// Production error handler
app.use(errorHandlers.productionErrors);

// Export the app
module.exports = app;
