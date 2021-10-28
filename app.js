const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


// middlewares 
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Two many request please stop it "
});

app.use("/api", limiter);



// data sanitization aganinst nosql query injection  
app.use(mongoSanitize())


// data sanitixation aginst csrf  XXS
app.use(xss())

// prevent parameter pollutoin  
// app.use(hpp({
//     whitelist:[
//         // whitelist helps to do dublicate 
//         'duration'
//     ]
// }))



app.use(express.static(`${__dirname}/starter/public`));



app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server .`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on this server .`)
    // err.status = 'fail',
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server .`, 404))
});

app.use(globalErrorHandler)

module.exports = app;

