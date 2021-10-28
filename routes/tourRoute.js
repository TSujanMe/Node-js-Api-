const express = require('express');
const router = express.Router()
const fs = require('fs');
const tourController = require('../controllers/tourController');
const { getTour, getTours, getTourStats, getMonthlyPlan, aliasTopTours, updateTour, deleteTour, createTours } = tourController
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoute');

const { createReview } = reviewController;
const { pretect,restrictTo } = authController;


// router.param('id',checkId);



router.use('/:tourId/review',reviewRouter)

// this route is build in and don't need to write anything about querying in the query string 
router.get('/top5cheap').get(aliasTopTours, getTours)
router.get('/tour-stats', getTourStats);
router.get('/mothly-plan/:year', getMonthlyPlan);


router.get('/', pretect, getTours);
// router.get('/', getTours);
router.route('/').post(createTours);


router.route('/:id')
    .get(getTour)
    .patch(updateTour);
 router.route('/:id').delete(pretect,restrictTo('admin','lead-gride'),deleteTour);
//  router.route('/:id').delete(pretect,deleteTour);



module.exports = router;