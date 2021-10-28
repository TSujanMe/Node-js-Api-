const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './config.env' });
const app = require('./app');


// this kind of handler should be at top so it implemet below the code of it  

// this is awesome.
// when there is problem to connect with mongoose  
// this is the best way to do that and can use it iin future 
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log(" unhandle regection shut down ... .")
        process.exit(1)
});




// like handling the syncrous code  like y is nut defined etc 
process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log(" UNcought exceouib  shut down ... .")
        process.exit(1)
    
});




const DB = process.env.DATABASE_LOCAL
mongoose.connect(DB, {
    useNewUrlParser: true,
    // useFindAndModify:false
}).then(con => {
    console.log('Mongodb has been connected successfully ')
})



const PORT = process.env.PORT || 3000
const  server = app.listen(PORT, console.log('Listening on the port 3000'));


