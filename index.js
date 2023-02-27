const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const port = process.env.PORT || 8080;
const io = new Server(server, {
  cors: "*",
  methods: "*",
});

//importing routes
const userRoute = require("./routes/userRoutes");
const productRoute = require("./routes/productRoutes");
const orderRoute = require("./routes/orderRoutes");
const imageRoute = require("./routes/imageRoutes");

const dotenv = require("dotenv");
dotenv.config();
//importing database connnetion
const connection = require("./utils/db");
//DB connection
connection();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

//routes

app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);
app.use("/api/images", imageRoute);

app.get("/", (req, res) => {
  res.send("Welcome to E-commerce Backend");
});

//socket-io
app.set("socketio", io);

server.listen(port, () => {
  console.log(`Server is listening on Port:${port}`);
});
