import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'

async function logUsersTable() {

    const db = await open({
        filename: path.join('database.db'),
        driver: sqlite3.Database
    })

    const tableName = 'users'

    try {

        const table = await db.all(`SELECT * FROM ${tableName}`)
        console.table(table)

    } catch (err) {

        console.error('Error fetching table: ', err.message)

    } finally {

        await db.close()

    }
}

logUsersTable()