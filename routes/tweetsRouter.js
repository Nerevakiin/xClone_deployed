import express from 'express'
import { getTweets } from '../controllers/tweetsController.js'
import { requireAuth } from '../middleware/requireAuth.js'


export const tweetsRouter = express.Router()

tweetsRouter.get('/', requireAuth, getTweets)