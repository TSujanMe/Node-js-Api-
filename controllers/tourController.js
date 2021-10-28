const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()

}







exports.getTours = catchAsync(async (req, res, next) => {

    // it executes a query 
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const tours = await features.query;
    // const tours = await query;

    // sending response 
    res.json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }
    })
});








exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    
    console.log(tour)
    // if (!tour) {
    //     return next(new AppError('No tour found with that id ', 404))
    // }
    res.json({
        status: "success",
        data: {
            tour: tour
        }
    })
});



exports.createTours = catchAsync(async (req, res) => {
    const data = req.body;
    const newTour = await Tour.create(data);
    res.status(200).json({
        status: "success",
        data: {
            newTour
        }
    })
});



exports.updateTour = catchAsync(async (req, res, next) => {

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updatedTour) {
        return next(new AppError('No tour found with that id ', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            'tour': updatedTour
        }
    })
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndRemove(req.params.id)
    if (!tour) {
        return next(new AppError('No tour found with that id ', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            'tour': tour
        }
    })
});











exports.getTourStats = catchAsync(async (req, res) => {

    // aggreate is return a aggregrate object 
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // id refers to what we want to group by  # it is imprtaant tp give 
                _id: null,
                num: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }, //it returns a maximum of all the collection as we give null in id i.e it give maximun of all collections 
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    console.log(stats)
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })
});




// aggretation pipeline in moogodb 
exports.getMonthlyPlan = catchAsync(async (req, res) => {

    const year = req.params.year * 1;// this is the trick to convert string into number 
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }

        },
        {
            $group: {
                _id: {
                    $month: '$startDates'
                },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: "$_id"
            }
        },
        {
            $project: {
                // it will hide the id as it is given of 0 if i give 1 then it will show 
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        }

    ]);
    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })
});
