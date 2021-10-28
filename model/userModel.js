const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "PLease tell us your name "]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "PLease tell us your Email "],
        lowercase: true,
        validate: [validator.isEmail, 'Please Provide us a Valid Email address']

    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, "PLease tell us your password "],
        minlength: 6,


    },
    passwordConfirm: {
        type: String,
        required: true,
        // only works on CREATE and  save   not on updating
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Passwodd dont match "
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

});




userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000//  means 1000 milisecinds  --- > 1 seconds 
    next()
})



userSchema.pre('save', async function (next) {
    // this refrers to the current document which is goona save  


    // only runs this function if the password not mofidified 
    if (!this.isModified('password')) return next()

    // hash the password 
    this.password = await bcrypt.hash(this.password, 12)
    // delete the password confiurm field 
    this.passwordConfirm = undefined;

    next()
})





userSchema.methods.correctPassword = async function (candidatePassowrd, userPassword) {
    return await bcrypt.compare(candidatePassowrd, userPassword)
};

userSchema.methods.chamgePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //it returns the time in milliseconds so we converted it into seconds 
        console.log(changeTimeStamp, JWTTimestamp)

        return JWTTimestamp < changeTimeStamp
    }

    // false mean that password isnot changed 
    return false

};





userSchema.methods.toJSON = function() {
    var obj = this.toObject(); //or var obj = this;
    delete obj.password;
    return obj;
   }


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    // we are just savingthe encrpted passowrd in database not to user email 
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    console.log({ resetToken }, this.passwordResetToken)
    return resetToken;
}







userSchema.pre('/^find/',function(next){
    // this points to current query 
    this.find({active:{$ne:false}})
    next()
})






















const User = mongoose.model('user', userSchema);

module.exports = User;