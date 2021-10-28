const router = require('express').Router({ mergeParams:true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');


const { pretect,restrictTo } = authController;
const { getReview,createReview }  = reviewController; 

router.get('/',getReview)
router.post('/',pretect,restrictTo('user'),createReview)

module.exports = router;