const express = require("express");
const cors= require("cors")
const axios = require("axios");
const Redis = require("redis")

const client= Redis.createClient()
const app = express();
const Default_Expiration= 3600
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.get("/photos",async (req,res)=>{
const albumId= req.query.albumId
const photos= await getOrSetCache(`photos?albumId=${albumId}`,async()=>{


    const {data }= await axios.get(
        `https://jsonplaceholder.typicode.com/photos/`,{params:{albumId} }
    )         
    
        return data

})
  res.json(photos)

})

app.get("/photos/:id",async(req,res)=>{

    const photo= await getOrSetCache(`photos:${req.params.id}`,async ()=>{
        const {data}= await axios.get(
            `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
        )         
    
            return data
        
    })
    res.json(photo)
})


function getOrSetCache(key,cb){
return new Promise((resolve,reject)=>{
client.get(key,async (err,data)=>{

    if(err) return reject(err)
    if(data!=null) return resolve(JSON.parse(data))
    const freshData=  await cb()
    client.setex(key,Default_Expiration,JSON.stringify(freshData))
    resolve (freshData)

})


})



}

app.listen(3000,()=>{

    console.log("running")
})