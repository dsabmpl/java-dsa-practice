window.addEventListener('load', bindEvents);
function bindEvents(){
    document.querySelector('#join').addEventListener('click', joinMeeting);
}
let localStream;
let socket;
let peers = {};
async function joinMeeting(){
    localStream = await navigator.mediaDevices.getUserMedia({audio:true, video:{facingMode:'user'}});
    const video = document.querySelector('#video');
    video.srcObject = localStream;
    video.muted = true; // for IOS
    video.playsInline = true; // for IOS

    // Socket + WebRTC
    socket = io();
    registerSocketEvents();
    socket.emit('join-meeting');
}

function registerSocketEvents(){
    // This code handles connecting to multiple peers simultaneously when joining a room/group call
    socket.on('peers', async (peers)=>{
        for(const id of peers){
            // Create a new peer connection for this specific peer
            const pc = makePeerConnection(id);
            await pc.setLocalDescription(await pc.createOffer()); // Generates an SDP
            // // Send offer to this peer via signaling server
            socket.emit('signal', {to:id, description: pc.localDescription});
        }
    });
    socket.on('signal', async ({from ,description, candidate})=>{
        const pc = makePeerConnection(from);
        // Handle SDP (Session Description Protocol) messages
        if (description) {
            if (description.type === "offer") { // If we received an OFFER from a remote peer
                // Set the remote peer's offer as our remote description
            // This tells us what the remote peer can support
                await pc.setRemoteDescription(description);
                // Create our answer based on the offer we received
            // This describes what we can support in response
                await pc.setLocalDescription(await pc.createAnswer());
                // Send our answer back to the peer who sent the offer
                socket.emit("signal", { to: from, description: pc.localDescription });
      } 
      else {
        // Set the remote peer's answer as our remote description
            // This completes the SDP negotiation process
              await pc.setRemoteDescription(description);
      }
    }
    //  // Handle ICE (Interactive Connectivity Establishment) candidates
    if (candidate) {
        // Add the network path information to establish connection
        // ICE candidates contain IP addresses, ports, and protocols
        // for finding the best route between peers
      await pc.addIceCandidate(candidate);
    }
    });
}

function makePeerConnection(id){
    if(peers[id]){
        return peers[id];
    }
    const pc = new RTCPeerConnection({
        iceServers :[{ urls: "stun:stun.l.google.com:19302" }]
    })
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.onicecandidate = e => {
    if (e.candidate) socket.emit("signal", { to: id, candidate: e.candidate });
  };

  pc.ontrack = e => {
    let v = document.getElementById("v-" + id);
    if (!v) {
      v = document.createElement("video");
      v.id = "v-" + id;
      v.autoplay = true;
      v.playsInline = true; // for ios
      v.className = "tile";
      document.getElementById("grid").appendChild(v);
    }
    v.srcObject = e.streams[0];  // ✅ FIX: use streams[0]
  };

  peers[id] = pc;
  return pc;
}