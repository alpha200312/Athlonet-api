
const express=require('express');
const app=express();
const router=require('./routes/user')

const connectdb=require('./config/db')
const dotenv=require('dotenv')
dotenv.config({path:"./config/config.env"});
connectdb();
app.use(express.json())

app.use('/athlonet/auth',router);
const port=process.env.PORT;

app.listen(port,'0.0.0.0',()=>{console.log("started on host in "+port)});


