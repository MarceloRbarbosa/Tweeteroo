import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb"; 
import dotenv from "dotenv";
import joi from "joi";
dotenv.config();

const app = express();
app.use(cors());
app.use(json());


const mongoCLient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoCLient.connect()
.then(()=> db = mongoCLient.db())
.catch((err)=> console.log(err.message));



app.get("/tweets", (req, res) => {
    db.collection("tweets").find().toArray()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(err.message))
});

app.get("/tweets/:id", (req, res) => {
    const id = req.params.id;
    const tweet = tweets.find(tweet => tweet._id === Number(id));
    res.send(tweet);
});



app.post("/sign-up", (req, res) => {
    const user = req.body;
    if (!user.username || !user.avatar) {
        return res.status(422).send("error")
    }

    users.push({ _id: users.length + 1, ...user });
    res.status(201).send("Usuario conectado")
})

app.post("/tweets", (req, res) => {
    const message = req.body;
    if(!message.username || !message.tweet){
        return res.status(422).send("error")
    }

    db.collection("tweets").insertOne(message)
    .then(()=>res.status(201).send("Seu tweet foi enviado com sucesso!"))
    .catch(err => res.status(500).send(err.message))
})

const porta = process.env.PORT || 5000;
app.listen(porta, () => {
    console.log(`Servidor rodando da porta ${porta}`);
});