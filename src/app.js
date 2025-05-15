import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.get("/tweets", (req, res)=>{
    const tweets = "varios tweets"
    res.send(tweets);
})



app.listen(5000, ()=> console.log("server ok"))