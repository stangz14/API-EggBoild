const express = require('express')
const cors = require('cors')
const line = require("@line/bot-sdk")
const axios = require('axios').default
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const UserModel = require('./models/User.js');

const env = dotenv.config().parsed
const PORT = process.env.PORT || 3000
const config = {
    channelAccessToken: '8E+D2PdWMA3T3cnPpyGWVbDAjN/IGQcU9cTMZOsCfcGpajFvrp6LFYYrOVISg1IiSrgIkZVFqxwkQPLRuFtwQU4XD+/osCF2H7wb90tJP0bv4rqQfD+DmitxxvpzrBIK7Cd+Q2zLdAoyPigIMaByJAdB04t89/1O/w1cDnyilFU= ',
    channelSecret: 'e0d8a6c5a63370f5769d8acc9935b0d2'
}

const mongoDB = "mongodb+srv://chokilover3:saharat4wichian5@eggboild.urpox3k.mongodb.net/eggboild";

const app = express()
app.use(cors())
const client = new line.Client(config);

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    client.pushMessage("U3f43e6bf10265e8f5b263e04f925dc1d", { type: 'text', text: 'Connected to MongoDB' })
});

app.post("/webhook", line.middleware(config), async (req, res) => {
    Promise.all(req.body.events.map(handleEvent)).then((result) =>
        res.json(result)
    );
})

app.post("/webhook/send/success/:id", async (req, res) => {
    const id = req.params.id;
    UserModel.findById({ _id: id })
        .then(user => {
            console.log(user)
            client.pushMessage(user?.userID, { type: 'text', text: 'ไข่สุก!!!!!!!' })
            UserModel.deleteOne({_id : user?._id})
            .then(user => {

            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})


app.post('/webhook/almostfinished/:id' , (req,res) =>{
    const id = req.params.id;
    UserModel.findById({ _id: id })
        .then(user => {
            console.log(user)
            client.pushMessage(user?.userID, { type: 'text', text: 'ไข่ใกล้สุกแล้วเหลือเวลาอีกไม่ถึง 1 นาที 30 วินาที' })
        })
        .catch(err => console.log(err))
})

app.post("/createUser" , (req , res) =>{
    UserModel.create({})
    .then(user =>{
        res.json("https://line.me/R/oaMessage/@709hyfzh?Login" + user._id)
        res.send({id : user._id})
    })
    .catch(err => res.json(err))
})

app.get('/getUser/:id' , (req , res) =>{
    const id = req.params.id;
    UserModel.findById({ _id: id })
        .then(user => {
            console.log(user)
            res.send(user._id)
        })
        .catch(err => console.log(err))
})

const handleEvent = async (event) => {
    const key = event.message.text.slice(0, 5);
    const id = event.message.text.slice(5, 29)
    if (event.type === 'message' && event.message.type === 'text' && key === "Login") {
        console.log(event);
        UserModel.find({ userID: event.source.userId })
            .then(users => {
                if (users.length > 0) {
                    console.log("Have User")
                    client.replyMessage(event.replyToken, { type: "text", text: "Have User" })
                } else {
                    console.log("not User")
                    UserModel.findByIdAndUpdate({ _id: id }, { userID: event.source.userId })
                        .then(users => {
                            console.log(users)
                            client.replyMessage(event.replyToken, { type: "text", text: "success" })
                        })
                        .catch(err => console.log(err))

                }
            })
            .catch(err => console.log(err))

    } else {
        console.log(event);
        client.replyMessage(event.replyToken, { type: 'text', text: "kuy" })
    }

}



app.listen(PORT, () => {
    console.log(`Server is Running  ${PORT}`)
})