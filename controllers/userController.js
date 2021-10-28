const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



const filteredObj = (obj,...allowedField)=>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if (allowedField.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.getAllUsers =catchAsync(async(req,res)=>{
    const users=  await User.find({})
    res.json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    })
});



exports.updateMe = catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route isnot for password .. please use /updatePassword ",400))
    };
    const { name,email } = req.body;

    const filterdBody = filterObj(req.body,'name','email')
    const updateUser = await User.findByIdAndUpdate(req.user.id,filterdBody,{ new:true,runValidators:true })

    res.status(200).json({
        status:"success",
        data:{
            updateUser
        }
    })
})
exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{ active:false })
    res.status(200).json({
        status:"success",
        data:null
    })
})






exports.getUser = (req,res)=>{
    res.status(500).json({
        status: "error",
        message: " get single data "
    })
}
exports.createUsers = (req,res)=>{
    res.status(500).json({
        status: "posts ",
        message: " post the users   "
    })
}
exports.updateUser = (req,res)=>{
    res.status(500).json({
        status: "update",
        message: " Update the users  "
    })
}
exports.deleteUser = (req,res)=>{
    res.status(500).json({
        status: "delete",
        message: " Deelte the Users  "
    })
}

