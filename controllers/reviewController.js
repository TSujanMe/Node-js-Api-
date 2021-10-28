const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



exports.getReview = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId)  filter = {tour:req.params.tourId}
    const review = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        review: review
    })
});

exports.createReview = catchAsync(async (req, res, next) => {
    // nested routes 
    if ( !req.body.tour) req.body.tour =req.params.tourId;
    if ( !req.body.user) req.body.user =req.user.id;

    const review = await Review.create(req.body);
    



    res.status(200).json({
        status: 'success',
        results: review.length,
        review: review
    })
});