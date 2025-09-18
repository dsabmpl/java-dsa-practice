import express from 'express';
import https from 'https'; // Adding https
import fs from 'fs';
import {Server} from 'socket.io';
const app = express();
// Adding Certificates to Https
const httpsServer = https.createServer({
    cert: fs.readFileSync('./cert/server.crt'),
    key: fs.readFileSync('./cert/server.key')
},app);
app.use(express.static('public'));

// Using Socket.io
const io = new Server(httpsServer, {cors:{origin:'*'}});

// attach events for server socket to listen and emit
// if new request comes from the browser
io.on('connection', socket=>{
    socket.on('join-meeting', ()=>{
        const peers = [...io.sockets.sockets.keys()].filter(id=>id !==socket.id);
        socket.emit("peers", peers);
    });
    // WEBRTC Signal - relay offer/ answer/ ice
    socket.on('signal', ({to, description , candidate})=>{
            // to - Identifies the target recipient
            // description - Contains the SDP (Session Description Protocol) data
            // candidate - Contains ICE (Interactive Connectivity Establishment) candidate information
            if(to){
                io.to(to).emit("signal", {from: socket.id, description, candidate});
            }
    })
})

// Start Https Server
httpsServer.listen(1234, err=>{
    if(err){
        console.log('Server Crash ', err);
    }
    else{
        console.log('Server Up and Running ', 'http://localhost:1234');
    }
})