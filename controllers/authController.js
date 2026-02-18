import validator from 'validator'
import { getDBConnection } from '../db/db.js'
import bcrypt from 'bcryptjs'

export async function registerUser(req, res) {
    
    
    
    let {name, email, username, password} = req.body // destructuring the body properties

    // check if all necessary properties exist, otherwise return
    if (!name || !email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required'})
    }

    // trim them of unecessary spaces
    name = name.trim()
    email = email.trim()
    username = username.trim().toLowerCase()

    // check the username regex requirements
    if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
        return res.status(400).json({error: 'invalid username'})
    }

    // check if the email is actually an email
    if (!validator.isEmail(email)) {
        res.status(400).json({error: 'invalid email'})
    }

    

    try {

        const hashedPassword = await bcrypt.hash(password, 10) // hashing the password with bcrypt

        const db = await getDBConnection()

        // check if the user registering is already in the db
        const existing = await db.get(`SELECT id FROM users WHERE email = ? OR username = ?`,
            [email, username]
        )

        if (existing) {
            return res.status(400).json({error: 'email or username already in use'})
        }

        const result = await db.run('INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
            [name, email, username, hashedPassword]
        )

        req.session.userId = result.lastID // this will bind our logged in user to the session !! for later use

        res.status(201).json({ message: 'user registered succesfully'})


    } catch (err) {
        console.error('registration error: ', err.message)
        res.status(500).json({error: 'registration failed, server side issue'})
    }
}



export async function loginUser(req, res) {

    console.log('login controller here. req.body is: ', req.body)

    let {username, password} = req.body

    if (!username || !password) {
        return res.status(400).json({error: 'fill all'})
    }

    username = username.trim()

    try {

        const db = await getDBConnection()

        console.log('searching for username: ', username)
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
        console.log('user found: ', user)

        // --- checking if such username exists in the database 
        if (!user) {
            return res.status(400).json({error: 'invalid credentials name'})
        }

        // compares th password given with the password hash in the db
        const isValid = await bcrypt.compare(password, user.password)
        
        if (!isValid) {
            return res.status(400).json({error: 'invalid credentials password'})
        }

        console.log('user trying to login: ', user)

        req.session.userId = user.id 
        req.session.userName = user.name
        
        res.json({
            message: 'Logged in!',
            user: {name: user.name}
        })

    } catch (err) {
        console.error('login error: ', err.message)
    }

}

export async function logoutUser(req, res) {
    console.log('logout btn pressed from the server')
    req.session.destroy( () => {
        return res.json({ message: 'logged out' })
    })
}
