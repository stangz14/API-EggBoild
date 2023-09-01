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
    channelAccessToken: 'WOvfI/Jjc6C5rhij80a4k/3DIuzT9PGvBUSylzM0BAhXJDiIkcvn8Uxmpgg9ryiEsICTpQdDikEu7yvATF7bF5mcZdB6tdcXHbP23LYars9cI1CVmf4soDspEVe2t+TdgBndXj1JTKiXG1zILH4emAdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'bcb41772584d2afddc08df4e41f8823b'
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
            client.pushMessage(user?.userID, { type: 'text', text: 'ไข่ของคุณสุกแล้วนะ โปรดไปรับด้วย' })
            client.pushMessage(user?.userID, { type: 'text', text: 'ขอบคุณสำหรับการใช้บริการของเรา' })
            UserModel.deleteOne({ _id: user?._id })
                .then(user => {
                    res.json(user)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})


app.post('/webhook/almostfinished/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findById({ _id: id })
        .then(user => {
            console.log(user)
            client.pushMessage(user?.userID, { type: 'text', text: 'ไข่ใกล้สุกแล้วเหลือเวลาอีกไม่ถึง 1 นาที 30 วินาที' })
            res.json("success pushmessage")
        })
        .catch(err => console.log(err))
})

app.post("/createUser", (req, res) => {
    UserModel.create({})
        .then(user => {
            res.json("https://line.me/R/oaMessage/@889zwavc?Login" + user._id)
            res.send({ id: user._id })
        })
        .catch(err => res.json(err))
})

app.get('/getUser/:id', (req, res) => {
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
        UserModel.findById({ _id: id })
            .then(user => {
                console.log(user?.userID?.length)
                if (user?.userID?.length > 0) {
                    client.replyMessage(event.replyToken, { type: "text", text: "เครื่องต้นไข่เครื่องนี้ ได้รับการลงทะเบียนกับบัญชีไลน์อื่นไว้แล้ว" })
                }
                else {
                    UserModel.find({ userID: event.source.userId })
                        .then(checkuser => {
                            if (checkuser.length > 0) {
                                client.replyMessage(event.replyToken, { type: "text", text: "บัญชีนี้ได้มีการลงทะเบียนสำเร็จแล้ว" })
                            } else {

                                UserModel.findByIdAndUpdate({ _id: id }, { userID: event.source.userId })
                                    .then(newuser => {
                                        client.replyMessage(event.replyToken, { type: "text", text: "ลงทะเบียนสำเร็จ โปรดรอรับไข่ได้เลย" })
                                    })
                                    .catch(err => console.log(err))
                            }
                        })
                        .catch(err => console.log(err))
                }
            })
            .catch(err => client.replyMessage(event.replyToken, { type: "text", text: "รหัสลงทะเบียนผิดพลาดโปรดตรวจสอบอีกครั้ง" }))

    } else {
        console.log(event);
        client.replyMessage(event.replyToken, { type: 'text', text: "คำสั่งผิดพลาดโปรดลองอีกครั้ง" })
    }

}



app.listen(PORT, () => {
    console.log(`Server is Running  ${PORT}`)
})