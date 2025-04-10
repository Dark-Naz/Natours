const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3)Render that template using data in 1)

  console.log(req.params);
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) Build template
  // 3) Render template using data from 1)
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' https://unpkg.com")
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  console.log(tour);
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      ('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000"),
    )
    .render('login', {
      title: 'Log in',
    });
  console.log(res);
};
