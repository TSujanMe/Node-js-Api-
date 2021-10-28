const mongoose = require('mongoose');
const slugify = require('slugify');
var validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tour Must have a name "],
        unique: [true, 'name is must be unique '],
        trim: true,
        maxlength: [50, 'NAme must have a less than 40 character'],
        minlength: [10, 'NAme must have a more than 10 character'],
    },
    duration: {
        type: Number,
        required: [true, "A Tour Must have a duration "]
    },
    slug: String,
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour Must have a ground size ']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a Difficulty'],
        enum:
        {
            values: ['easy', 'medium', 'difficult'],
            message: "only  easy , medium and difficult is allowed"
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, "rating must be above 1 "],
        max: [5, "rating must below 5  "],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7

    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Price is required . "]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // THIS ONLY POINTS TO current document  on new document creation not on update or anything else 
                return val < this.price
            },
            message: "discount should be below then the regular price ({VALUE}) "
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "Tour must Have summary "]
    },
    description: {
        type: String,
        trim: true

    },
    imageCover: {
        type: String,
        required: [true, 'It must have a Cover Image ']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean, default: false
    },

    // TO CREATE GEOJSON WE NNED TO HAVE A ATLEST 2 FIELDS 
    // we need to create new object and that object nedds to have atleast 2 fields name 
    // type shouldbe string and sjhould be POINT OR OTHER GROMATRICCS  
    //  THIS STARTLOCATION ISNOT A DOCUMENT IT IS JUST A OBJECT DESCRIBING CERTAIN POINT ON EARTH
    startLocation: {
        // GEOjson 
        type: {
            type: String,
            default: "Point",
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },


    // this is how we create embeded document  ...always needs to use array  at first
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        // to do embedeb object we need to wrap inside of array and insode 
        // of array we need to use object {} and do the things we want
        {
            type: mongoose.Schema.ObjectId,
            ref:"user"
        }
    ]

}, {
    toJSON: { virtuals: true } //due to that virtual  propertiy is showen when req is made 
});

// it doesnot save in to the database 
tourSchema.virtual('durationweek').get(function () {
    return this.duration / 7;
})

// this is virtual populate  
tourSchema.virtual('reviews',{
    ref:"Review",
    foreignField:'tour',
    localField:'_id'
});



// this is document middleware . 
// it runs before the save command and .create command
//  but not in insertMany and other like findByIdandUpdate ,update things  etc- ... 
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
});


// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async el => await User.findById(el))
//     console.log(guidesPromises)
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })






tourSchema.pre(/^find/, function (next) {
    // in query middleware this always points to current query 
    this.populate({
        path:'guides',
        select:'-passwordChangedAt -__v',
        

    });
    next()
})




// this is query middleware  and runs whenever wee use query method like find and findOne etc /...
// this regex expression means that whenever the anything startes with find are  apply it  
tourSchema.pre(/^find/, function (next) {
    // tourSchema.pre('find', function (next) {
    this.find({ secretTour: { $ne: true } })// ne refers to notEqualto

    next()
});






tourSchema.pre('aggeregate', function (next) {
    // in this agreation middleware this referes to the arreration obj .. 
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

    next()
})






const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;

