const mongoose = require('mongoose');



const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review Cannot be empty']
    },
    rating: {
        type: Number,
        max: 5,
        min: 1,

    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "you only can do review on tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "you only can do review on tour when you beleong to user"]
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: "tour",
    //     select: 'name'

    // })
    this.populate({
        path: "user",
        select: "name photo"
    });
    next()
})



const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;