// const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const crypto = require('crypto');
// const mongoSanitize = require('mongo-sanitize');
// const domPurify = require('dompurify');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //serving static files (without using a route)

// Further helmet configuration for Security Policy (CSP)

app.use(
  cors({
    credentials: true,
    origin: 'http//127.0.0.1:3000',
    // allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);

app.options('*', cors());

// Generate nonce
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64'); //Generates a unique nonce
  console.log(res.locals.nonce, 'Hello from nonce');
  next();
});

// Allowed sources for varios assets
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

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUrl: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        // `'nonce-${res.locals.nonce}'`, //Dynamically apply nonce to inline scripts
        ...scriptSrcUrls,
      ],

      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: [
        "'self'",
        'blob:',
        'http://127.0.0.1:3000',
        'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.7/axios.min.js',

        // 'https://cdnjs.cloudflare.com',
        'https://tile.openstreetmap.org',
      ],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

// app.use(
//   cors({
//     origin: 'http://127.0.0.1:3000/api/v1', //Frontend domain?
//     credentials: true,
//     allowedHeaders: ['Authorization', 'Content-Type'],
//   }),
// );

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
  console.log(req.cookies);
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
