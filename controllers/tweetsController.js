import {tweetsData} from '../data.js'

export async function getTweets(req, res) {
    
    res.json(tweetsData)
}