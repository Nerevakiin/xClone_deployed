import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import path from 'node:path'
import { create } from 'node:domain'

async function createTable() {

    try {
    
        const db = await open({
            filename: path.join('database.db'),
            driver: sqlite3.Database
        })

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        )

        await db.close()
        console.log('table users created succesfully!')

    } catch (err) {
        console.error('error with creating table users')
    }
    
}

createTable()
