// const fs = require('fs');
const cors = require('cors');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const crypto = require('crypto');
// const mongoSanitize = require('mongo-sanitize');
// const domPurify = require('dompurify');
const hpp = require('hpp');
const pug = require('pug');
const cookieParser = require('cookie-parser');

// const swaggerUi = require('swagger-ui-express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.use(
  cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    // methods: 'GET,POST,PUT,DELETE',
    // allowedHeaders: ['Authorization', 'Content-Type'],
    // origin: true,
  }),
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //serving static files (without using a route)

// Further helmet configuration for Security Policy (CSP)

// app.options(
//   '*',
//   cors({
//     origin: 'http://127.0.0.1:3000',
//     credentials: true,
//   }),
// );
// app.all('*', (req, res, next) => {
//   // HEADER OPTIONS
//   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
//   res.header('Access-Control-Allow-Origin', '*'); ///not recommended tho, but for development!
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Accept, X-Requested-With, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization',
//   );
//   // ////////////////
//   next();
// });

// const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (allowedOrigins.includes(origin) || !origin) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by Cors'));
//       }
//     },
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//     credentials: true,
//     allowedHeaders: ['Authorization', 'Content-Type'],
//   }),
// );

// Generate nonce
// app.use((req, res, next) => {
//   res.locals.nonce = crypto.randomBytes(16).toString('base64'); //Generates a unique nonce
//   console.log(res.locals.nonce, 'Hello from nonce');
//   next();
// });

// Allowed sources for various assets
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  // 'https://cdnjs.cloudflare.com',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.7/axios.min.js',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  // 'https://cdnjs.cloudflare.com',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.7/axios.min.js',

  // 'http://127.0.0.1:3000',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'http:', 'data:'],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
//       styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
//     },
//   }),
// );
app.use(helmet());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'child-src': ['blob:'],
      'connect-src': [
        // 'https://www.openstreetmap.org',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        'https://*.cloudflare.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'ws://127.0.0.1:*',
        'ws://localhost:1234/',
      ],
      'default-src': ["'self'", 'data:', 'blob', 'https', 'ws:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://*.openstreetmap.org',
        'https://unpkg.com',
      ],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        'https://www.openstreetmap.org',
        'https://unpkg.com',
        'https://*.cloudflare.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      'style-src': ["'self'", "'unsafe-inline'", 'https:'],
      'worker-src': ['blob:'],
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading requests from body to req.body
app.use(express.json({ limit: '10kb' })); //
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(domPurify());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('Request Cookies:', req.cookies);
  next(); //always call next
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

// 2) ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
// const tourRouter = express.Router();
// const userRouter = express.Router();

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4) START SERVER

module.exports = app;
