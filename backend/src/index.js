//require('dotenv').config({path: './env'})

import express from "express";
//const app = express()
import {app} from './app.js'

import dotenv from "dotenv"

import connectDB from "./db/index.js";



dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port: ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("mongo db connection failed", err);

})




