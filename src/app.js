import express, { json } from "express";
import cors from "cors";
import joi from "joi";

const app = express();
app.use(cors());
app.use(json());



const users = [
    {
        _id: 1,
        username: "bobesponja",
        avatar: "https://bobesponja.com.br/imagens/thumbnail.png"
    },
    {
        _id: 2,
        username: "Patrick",
        avatar: "https://bobesponja.com.br/imagens/thumbnail.png"
    },
    {
        _id: 3,
        username: "Lula Molusco",
        avatar: "https://bobesponja.com.br/imagens/thumbnail.png"
    }
];

const tweets = [
    {
        _id: 1,
        username: "bobesponja",
        tweet: "Eu faço hambúrguer de siri!"
    },
    {
        _id: 2,
        username: "Patrick",
        tweet: "Eu amo hambúrguer de siri!"
    },
    {
        _id: 3,
        username: "Lula Molusco",
        tweet: "Eu odeio hambúrguer de siri!"
    }
];


app.get("/tweets", (req, res) => {
    res.send(tweets);
});

app.get("/tweets/:id", (req, res) => {
    const id = req.params.id;
    const tweet = tweets.find(tweet => tweet.id === Number(id));
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

    tweets.push({ _id: tweets.length + 1, ...message });
    res.status(201).send("msg enviada");
})


app.listen(5000);