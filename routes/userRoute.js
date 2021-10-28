const express = require('express');
const router = express.Router()
const userContorllers = require('../controllers/userController');
const authController = require('../controllers/authController');

const { getAllUsers, createUsers, getUser, updateUser, deleteUser,deleteMe,updateMe } = userContorllers;

const { signup, deleteuser, user, login, resetPassword, forgetPassword, updatePassword, pretect,restrictTo } = authController

// auth related router 
router.post('/signup', signup)
router.post('/login', login)
router.post('/forgetPassword', forgetPassword)
router.patch('/resetPassword/:token', resetPassword)
router.patch('/updatePassword', pretect, updatePassword);



router.patch('/updateMe', pretect, updateMe)
router.patch('/deleteMe', pretect, deleteMe)



// router.delete('/deleteMe', pretect, deleteMe)
router.route('/').get(getAllUsers).post(createUsers)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)







module.exports = router