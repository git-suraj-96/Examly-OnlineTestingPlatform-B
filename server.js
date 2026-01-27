require('dotenv').config();
const express = require('express');
const app = express();
const logger = require('morgan');
const cors = require("cors");
const errorHandler = require('./middlewares/errorhandler.middleware');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');


// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(cors());
app.use(cookieParser());
connectDB();

// Routes
const userRoutes = require('./routes/user.routes');
app.use('/user', userRoutes);

const teacherRoutes = require('./routes/teacher.routes');
app.use('/teacher', teacherRoutes);

const studentRoutes = require('./routes/studnet.routes');
app.use('/student', studentRoutes);


// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("SAAS Server is running on PORT: ", PORT);
})