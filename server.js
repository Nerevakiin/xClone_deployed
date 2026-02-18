import express from 'express'
import https from 'https'
import fs from 'fs'
import { WebSocketServer, WebSocket } from 'ws'
import { tweetsRouter } from './routes/tweetsRouter.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import session from 'express-session'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config() // setting up the dot env file to store the secret

const app = express()
const PORT = 8000
const secret = process.env.SPIRAL_SESSION_SECRET || 'kolotsibouxalaoua'


const serverOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}


// ===== middleware section ========

// CORS allow us to deploy our backend so others can also interact with it
app.use(cors({
    origin: `https://192.168.100.3:${PORT}`,
    credentials: true
}))

app.use(express.json())

// express-session set for authentication credentials and cookies to keep the session
const sessionMiddleware = session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
    }
})

app.use(sessionMiddleware)




app.use('/api/auth/me', meRouter)
app.use('/api/auth', authRouter)
app.use('/api/tweets', tweetsRouter)


app.use(express.static('public'))



// create the HTTPS server (REQUIRED for WebSockets + Express)
const server = https.createServer(serverOptions, app)

// ======= create the WebSocket server =======
const wss = new WebSocketServer({ server }) // <- pass the HTTP server here




// websocket connection handler. this handles the new connection. Runs for each new client that connects !!!!!

wss.on('connection', (ws, request) => {
    ws.on('error', console.error)

    console.log('NEW WEBSOCKET CONNECTION!')

    sessionMiddleware(request, {}, () => {

        // now request.session is available
        const userName = request.session.userName || 'agnwsto poutanaki'

        // if (!userName) {
        //     console.log('no ws for unlogged users')
        //     ws.close()
        //     return
        // }

        ws.username = userName
        console.log(`${ws.username} connected via websocket`)
    })

    // const cookies = request.headers.cookie 

    // Handle messages from this client 
    ws.on('message', (data) => {

        console.log('RECEIVED: ', data.toString())

        try {

            // parse what the client sent
            const clientData = JSON.parse(data.toString())

            if (clientData.type === 'chat') {

                // create a structure message
                const messageObj = {
                    type: 'chat',
                    user: ws.username,
                    text: clientData.text,
                    timestamp: new Date().toLocaleTimeString()
                }


                //broadcast to all clients except the sender
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(messageObj)) // if its not stringified it returns an object blob
                    }
                })

            } else {
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data.toString())
                    }
                })
            }


        } catch (err) {
            console.error('Error processing message:', err);
        }



    })

    // send welcome message
    ws.send(JSON.stringify({
        type: 'system',
        text: 'wra na gleipseis poutses gay adra'
    }))
})

// ===================







app.use((req, res) => {
    res.status(400).json({
        error: 'invalid URL'
    })
})

server.listen(PORT, () => {
    console.log(`Server running and listening at port: ${PORT}`)
}).on('error', (err) => {
    console.log('Failed to start server: ', err)
})