import { getDBConnection } from "../db/db.js";


export async function getCurrentUser(req, res) {

    try {

        const db = await getDBConnection()

        // see if there is no logged in user
        if (!req.session || !req.session.userId) {
            return res.json({ isLoggedIn: false })
        }

        // find the logged in user by quering the db where id matches the userId 
        // const user = await db.get('SELECT name FROM users WHERE id = ?', [req.session.userId])

        res.json({
            isLoggedIn: true,
            name: req.session.userName
        })

    } catch (err) {
        console.error('getcurrentuser error: ', err.message)
        res.status(500).json({ error: 'internal server error' })
    }
}