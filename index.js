const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose")
require("dotenv").config();
const userRoutes=require("./routes/userRoutes")
const messageRoutes=require("./routes/messagesRoutes")
const socket=require("socket.io")


const app=express();
app.use(cors());
app.use(express.json())


mongoose.connect(process.env.MONGO_DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then((data)=>{
    console.log(`mongo is connected to the host:${data.connection.host}`);
}).catch((err)=>{
    console.log(err);
})

app.use("/api/auth",userRoutes)
app.use("/api/messages",messageRoutes)
const server=app.listen(process.env.PORT,()=>{
    console.log(`server is connected on port:${process.env.PORT}`)
})

const io=socket(server,{
    cors:{
        origin:process.env.ORIGIN,
        credentials:true,
    }
})

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});