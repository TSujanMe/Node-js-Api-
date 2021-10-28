const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const SendEmail = require('../utils/email');





const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 24 * 60 * 60 * 1000),
        httpOnly: true

    }
    if (process.env.NODE_ENV) cookieOption.secure= true;

    user.password = undefined;
    res.cookie('jwt', token)
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async (req, res, next) => {
    // const { name, email, password, passwordConfirm, passwordChangedAt } = req.body
   
    const user = await User.create(req.body);
    createSendToken(user, 201, res)

});



exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;


    // if email and password actualy exists 
    if (!email || !password) {
        return next(new AppError("Please Provide the Email and password ", 404))
    }

    const user = await User.findOne({ email });
    console.log(user)

    // if user exist  
    // password is corrent or not 

    if (!user || !( await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect password or email", 404))
    }




    // sending the json web token 
    createSendToken(user, 200, res)

});





// protect route 
exports.pretect = catchAsync(async (req, res, next) => {
    // first get the token check if it exist or there  
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

    }


    if (!token) {
        return next(new AppError('You are not Logged In..', 401))
    }

    // validating the token  OR varification Token 

    // *note  promisify is the function given by util builtin method in node js which handle the ascyncscrouns tasks 
    // and it returns a promise 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // if check if the user still exists like if he delete his account hten we don't want to still log him 
    // so we are again doing that recheck that if that id is exists or not 
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("U are not authenticated please login "))
    };



    // check if the user change password after the jwt was issued 
    // iat stands for issued at 
    if (currentUser.chamgePasswordAfter(decoded.iat)) {
        return next(new AppError("User Recently change the password please login in again "))
    }

    req.user = currentUser

    next()
});



// it restrict that where i am able to delete it or not  

exports.restrictTo = (...roles) => {
    // roles is the arrray comming 
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You don't have a permission to do this action ", 403))
        }
        next()
        // if there isno error and contition fulfilled then this next  allows to go to next middleware 
    }
}







exports.forgetPassword = catchAsync(async (req, res, next) => {
    // get user besed ON POSTED EM,AIL 
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError("THier is not user with this email ", 404))
    }

    // generate the random reset token

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // { validateBoforeSave:false } is helps to not validate anything comming from req while saving 
    // it desable the validation  

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `FORGOT YOUR PSSWORD SUBMIT A PATCH REQ WITH YOUR NEW PASSWORD  NAD PASSWORD CONFIRM TO ${resetUrl}.
    if you know your passwordthen please ignore it madarchot ..
    `;

    try {
        // send it to user's email  
        await SendEmail({
            email: user.email,
            subject: "your password reset token ,, nOte this is noly for 10 min ",
            message
        })

        res.status(200).json({
            messagE: "Success",
            message: "Token send to Email "
        })

    } catch (errr) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("Error Occured on sending email Trt again later", 500))
    }


})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // first get the user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetexpires: { $gt: Date.now() } });



    // set the new password and token isnot expired then onnly we have to allowes 
    if (!user) {
        return next(new AppError("Token has been expired or invlid "))
    }

    // update the changePasswrodat  property for the user  
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;


    await user.save()

    // log the userin and send JWT  

    createSendToken(user, 200, res)



});



exports.updatePassword = catchAsync(async (req, res, next) => {
    // get the users from collections 
    console.log(req)

    const user = await User.findById(req.user.id).select('+password');

    // we need to check if the posted passwrod is correct ? 
    const { passwordConfirm, password } = req.body;
    // password confirm refers to your currnt password before update oapssword 
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
      }
    

    // if passwrod is correct then update the password 
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save()
    createSendToken(user, 201, res)


});














exports.deleteuser = catchAsync(async (req, res, next) => {

    await User.deleteMany()
    res.send("deleted ")
});

exports.user = catchAsync(async (req, res, next) => {
    const usr = await User.find()
    res.send(usr)
});


