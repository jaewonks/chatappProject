const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors')

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const server = require('http').createServer(app)
const io = require('socket.io')(server)
const config = require("./config/key");

const { Chat } = require('./models/Chat')

const fs = require('fs');
const multer = require('multer')
const { auth } = require('./middleware/auth')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
  fileFilter: (req, file, cd) => {
    const ext = path.extname(file.originalname)
    if(ext !== '.jpg' && ext !== '.png' && ext !== '.mp4'){
      return cd(res.status(400).end('Only jpg, png, mp4 is allowed'), false)
    }
    cd(null, true)
  }
})
const upload = multer({ storage: storage }).single('file')

const mongoose = require("mongoose");
const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(cors())

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());

//프론트엔드에서 보내는 정보를 처리(axios)
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/product', require('./routes/product'));

app.post('/api/chat/uploadfiles', auth ,(req, res) => {
    upload(req, res, err => {
      if(err) {
        return res.json({ success: false, err })
      }
      return res.json({ success:true, url: res.req.file.path })
    })
});

io.on("connection", socket => {
    socket.on("Input Chat Message", msg => {
      connect.then(db => {
        try{
          let chat = new Chat({ 
            message: msg.chatMessage,
            sender: msg.userId,
            type: msg.type
          })
          //정보를 DB에 저장한다.
          chat.save((err, doc) => {
            if(err) return res.json({ success: false, err })
            //DB에서 정보를 찾는다
            Chat.find({ "_id": doc._id })
                .populate("sender")
                .exec((err, doc)=> {
                return io.emit("Output Chat Message", doc);
            })
          })
      } catch (error) {
        console.error(error);
      }
    })
   })
})

//node js쪽에서 정적 파일을 제공해주지 못하기때문에 필요한 코드
//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/upload', express.static('upload'));
app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder   
  // All the javascript and css files will be read and served from this folder
  app.use(express.static("client/build"));

  // index.html for all page routes    html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

server.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});