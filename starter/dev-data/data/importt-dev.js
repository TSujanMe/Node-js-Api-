const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');


// load models 
const Tour = require('../../../model/tourModel');

// connect from db 
mongoose.connect('mongodb://localhost:27017/nautors', {
    useNewUrlParser: true,
});
console.log('Mongodb COnnected !! ')


// read the json FIles 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

console.log(tours)
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data sucessfully added ")
    } catch (error) {
        console.log(error)
    }
    process.exit()
};

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log("Data sucessfully deleted ")
    } catch (error) {
        console.log(error)
    }
    process.exit()
};



if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d'){
    deleteData()
}