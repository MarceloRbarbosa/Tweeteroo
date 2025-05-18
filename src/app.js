import express, { json } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const mongoCLient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoCLient
  .connect()
  .then(() => (db = mongoCLient.db()))
  .catch((err) => console.log(err.message));

app.post("/sign-up", async (req, res) => {
  const user = req.body;

  const userSchema = joi.object({
    username: joi.string().required(),
    avatar: joi.string().required(),
  });

  const validation = userSchema.validate(user, { abortEarly: false });
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(message);
  }

  try {
    const newUser = await db
      .collection("users")
      .findOne({ username: user.username });
    if (newUser) {
      return res.status(409).send("Este usuario já existe!");
    }
    await db.collection("users").insertOne(user);
    res.status(201).send("Usuário criado com sucesso!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/tweets", async (req, res) => {
  const message = req.body;

  const tweetSchema = joi.object({
    username: joi.string().required(),
    tweet: joi.string().required(),
  });

  const validation = tweetSchema.validate(message, { abortEarly: false });
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(message);
  }

  try {
    const userExist = await db.collection("users").findOne({username:message.username});
    if(!userExist){
        return res.status(401).send("Usuário não autorizado, realize o login na plataforma, para poder enviar seu tweet")
    }
    await db.collection("tweets").insertOne(message);
    res.status(201).send("Seu tweet foi enviado com sucesso!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/tweets", async (req, res) => {
  try {
    const tweets = await db.collection("tweets")
    .aggregate([
        {
             $lookup: {
            from: "users", 
            localField: "username", 
            foreignField: "username", 
            as: "userInfo"
        }
    },
    {
        $unwind: "$userInfo"
    },
    {
        $project: {
            _id: 1,
            username: 1,
            avatar: "$userInfo.avatar",
            tweet: 1      
    }
},
{
          $sort: { _id: -1 } // Mais recentes primeiro
        }
    ])
    
.toArray();
    res.send(tweets);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/users", async (req, res) => {
    try{
        const user = await db.collection("users").find().toArray();
        res.send(user);
    } catch(err){
        res.status(500).send(err.message);
    }
});

app.delete("/tweets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.collection("tweets").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send("Esse tweet não existe!");
    }

    return res.status(204).send("Seu tweet foi deletado com sucesso!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/tweets/:id", async(req, res) => {
  const {id} = req.params;
  const message = req.body;

  const tweetSchema = joi.object({
    username: joi.string().required(),
    tweet: joi.string().required(),
  });

  const validation = tweetSchema.validate(message, { abortEarly: false });
  if (validation.error) {
    const message = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(message);
  }

  try{
  const result = await db.collection("tweets").updateOne({
    _id: new ObjectId(id)
  },{
    $set:{
        tweet: message.tweet
    }
  });

  if(result.matchedCount === 0){
   return  res.status(404).send("Esse tweet não existe");
  }

  return res.status(204).send("Tweet atualizado com sucesso!");
  }catch(err){
   return res.status(500).send(err.message);
  }
});



const porta = process.env.PORT || 5000;
app.listen(porta, () => {
  console.log(`Servidor rodando da porta ${porta}`);
});
