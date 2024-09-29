const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Import routers and handlers
const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');
const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const app = express();

// CORS configuration to allow all origins
app.use(cors({
  origin: true, // Allows all origins
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
app.get('/', (req, res) => {
  res.send('Hello World');
});

// 404 handler
app.use(errorHandlers.notFound);
// Production error handler
app.use(errorHandlers.productionErrors);

// Export the app
module.exports = app;
