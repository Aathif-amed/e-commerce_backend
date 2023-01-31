const express = require('express');
const app= express();
const http= require('http')
const server =http.createServer(app);
const {Server}=require('socket.io');
const cors=require('cors')
const port =  process.env.PORT||8080
const io=new Server(server,{
    cors:'*',
    methods:'*'
})

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Welcome to E-commerce Backend")
})

server.listen(port,()=>{
    console.log(`Server is listening on Port:${port}`);
})