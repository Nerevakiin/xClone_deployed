// ============ FRONT END WEBSOCKET !!! =======

const messagesDiv = document.getElementById('chatroom-inner')
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const chatInput = document.getElementById('chat-input')


let socket = null
let localStream = null
let peerConnection = null
let iceCandidateQueue = []

const typingIndicator = document.getElementById('typing-indicator')
let typingTimer = null

const configuration = {
    iceServers: [{ urls: "stun:stun1.l.google.com:5349" }]
}


export function initializeSocket() {

    console.log("Attempting to connect to WSS..."); // this to confirm function runs

    socket = new WebSocket('wss://192.168.100.3:8000/') // create the connection to the websocket server written in server.js



    // this event fires once when the connection is successfully established
    socket.addEventListener('open', (event) => {
        console.log('WEBSOCKET CONNECTION ESTABLISHED')
    })

    socket.addEventListener('error', (event) => {
        console.error("WebSocket Error Observed:", event);
    });




    socket.addEventListener('message', async (event) => {
        try {

            const data = JSON.parse(event.data)

            if (data.type === 'system') {

                const msg = document.createElement('div')
                msg.innerHTML = `<strong>${data.type}:</strong> ${data.text}` // contains the message from the server

                messagesDiv.appendChild(msg)
                messagesDiv.scrollTop = messagesDiv.scrollHeight // Auto-scroll to bottom
            }

            else if (data.type === 'chat') {
                displayMessage(data.user, data.text, data.timestamp)

            } else if (data.type === 'typing') {

                typingIndicator.textContent = `${data.user} is typing...`

                console.log('typing indicator socket')

                clearTimeout(typingTimer)
                typingTimer = setTimeout(() => {
                    typingIndicator.textContent = ''
                }, 3000) 
            }



            // WebRTC SIGNALLING LOGIC
            if (data.offer) {

                console.log('received offer, creating answer...')
                await handleOffer(data.offer)

            } else if (data.answer) {

                console.log('received answer...')
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
                processQueuedCandidates()

            } else if (data.candidate) {
                console.log('received ICE candidate')

                if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                } else {
                    console.log('queueing candidate: remoteDescription not set yet...')
                    iceCandidateQueue.push(data.candidate)
                }
            }


            if (data.type === 'hangup') {
                console.log('the other person hung up')
                hangUp()
            }




        } catch (err) {
            console.error('error parsing message: ', err)
        }
    })

}


export function sendChatMessage(jsonString) {

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(jsonString)
    } else {
        console.error("socket not connected")
    }
}

function displayMessage(user, text, time) {

    const msg = document.createElement('div')
    msg.innerHTML = `
    <span class="chat-time">${time} |</span>
    <strong>${user}:</strong> ${text}
    ` // contains the message from the server

    messagesDiv.appendChild(msg)
    messagesDiv.scrollTop = messagesDiv.scrollHeight // Auto-scroll to bottom
}

chatInput.addEventListener('input', (user) => {

    console.log('typing indicator socket')

    socket.send(JSON.stringify({
        type: 'typing',
        user: name || 'Stranger'
    }))
})



// ========== WebRTC LOGIC HERE ========

export let isCameraOpen = false

export async function startCamera() {
    try {
        const constraints = { 'video': true, 'audio': true }

        // wait for the user to give permission
        localStream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('got mediaStream: ', localStream)

        // fnd the video element
        localVideo.srcObject = localStream

        isCameraOpen = true
        return isCameraOpen

    } catch (err) {
        console.error('error accesing media devices: ', err)
    }
}

export async function stopCamera() {
    try {
        localStream.getTracks().forEach((track) => {
            track.stop();

            localVideo.srcObject = null
            isCameraOpen = false
            return isCameraOpen
        });
    } catch (err) {
        console.error('error closing media devices: ', err)
    }
}


// PEER CONNECTION SETUP 
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration)

    // when the browser find a conneciton path (ice candidate), send it to the other person
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ candidate: event.candidate }))
        }
    }

    // when the remote stream arrives, show it in the remote video tag
    peerConnection.ontrack = (event) => {
        console.log('got remote track: ', event.streams[0])
        remoteVideo.srcObject = event.streams[0]
    }

    // add my camera/mic to the connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

}


// THE HANDSHAKE

// this runs when i click the call button
export async function initiateCall(e) {

    e.preventDefault()
    console.log('call btn pressed')

    createPeerConnection()
    console.log('creating peer connection...')

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    console.log('sending offer...')
    socket.send(JSON.stringify({ offer: offer }))

}

export async function hangUpCall(e) {

    e.preventDefault()

    console.log('hanging up the call...')

    // run the cleanup locally
    hangUp()

    // tell the other person via the websocket
    socket.send(JSON.stringify({ type: 'hangup' }))
}

function hangUp() {

    if (peerConnection) {
        peerConnection.close()
        peerConnection = null
    }

    remoteVideo.srcObject = null

    iceCandidateQueue = []

}


// this runs when teh OTHEr person receives your offer
async function handleOffer(offer) {

    createPeerConnection()
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    console.log('sending answer...')

    socket.send(JSON.stringify({ answer: answer }))

    processQueuedCandidates()

}


async function processQueuedCandidates() {

    console.log(`Processing ${iceCandidateQueue.length} queued candidates.`)
    for (const candidate of iceCandidateQueue) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
    iceCandidateQueue = []
}