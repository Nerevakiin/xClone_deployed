import { v4 as uuidv4 } from 'https://jspm.dev/uuid'
import { checkAuth, renderGreeting, showHideMenuItems } from '/authUI.js'
import { logout } from '/logout.js'
import { initializeSocket, sendChatMessage, startCamera, initiateCall, hangUpCall, stopCamera, isCameraOpen } from '/socket.js'
import Uwuifier from "https://esm.sh/uwuifier"


const uwuifier = new Uwuifier() // THE UWUIFIER

let name = null; // Declare name at the top level

document.getElementById("logout-btn").addEventListener('click', logout)

// === init load for user
async function init() {
    name = await checkAuth()
    renderGreeting(name)
    showHideMenuItems(name)
    
}

init()

// ======= the new back end over engineered functionality

let tweetsData = [];

// Fetch tweets data from API on page load
async function initializeTweetsData() {

    try {

        const response = await fetch('/api/tweets')
        const data = await response.json()
        
        // Use localStorage if available, otherwise use API data
        tweetsData = JSON.parse(localStorage.getItem("tweetsData")) || data;
        render();

    } catch (error) {
        console.error('Error fetching tweets:', error)
    }
}

// Initialize data on page load
document.addEventListener('DOMContentLoaded', initializeTweetsData);






// =========== WEBSOCKET & WebRTC Logic =======

initializeSocket() // starting the socket here



// sends the message to the server when the btn is clicked

const chatInput = document.getElementById('chat-input')
const sendMsgBtn = document.getElementById('msg-btn')
const messagesDiv = document.getElementById('chatroom-inner')

const openCameraBtn = document.getElementById('camera-btn')
const clickBtn = document.getElementById('call-btn')
const hangUpBtn = document.getElementById('hang-btn')




// button that opens the camera

openCameraBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (!isCameraOpen) {
        startCamera()
        openCameraBtn.classList.add('camera-open')
    } else {
        stopCamera()
        openCameraBtn.classList.remove('camera-open')
    }
})

// CHAT LOGIC FRONT END

sendMsgBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const text = chatInput.value.trim()
    if (text === '') return 

    // generate local time
    const now = new Date().toLocaleTimeString()

    // show it to myself imediately in the front end
    displayMessage('Me', text, now)

    // send it to others
    const payload = {
        type: 'chat',
        text: text
    }

    sendChatMessage(JSON.stringify(payload))
    chatInput.value = ''

})





function displayMessage(user, text, time) {

    const msg = document.createElement('div')
    msg.innerHTML = `
    <span class="chat-time">${time} |</span>
    <strong>${user}:</strong> ${text}
    ` // contains the message from the server

    messagesDiv.appendChild(msg)
    messagesDiv.scrollTop = messagesDiv.scrollHeight // Auto-scroll to bottom
}








clickBtn.addEventListener('click', initiateCall)
hangUpBtn.addEventListener('click', hangUpCall)



// ====================








// ============== CLICK EVENTS ===============

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        let tweetId = e.target.dataset.like
        handleLikeClick(tweetId)
    }
    if (e.target.dataset.retweet) {
        let tweetId = e.target.dataset.retweet
        handleRetweetClick(tweetId)
    }
    if (e.target.dataset.reply) {
        let tweetId = e.target.dataset.reply
        handleReplyClick(tweetId)
    }
    if (e.target.dataset.delete) {
        let tweetId = e.target.dataset.delete
        handleDeleteBtnClick(tweetId)
    }
    if (e.target.id == "tweet-btn") {
        handleTweetBtnClick()
    }
    if (e.target.classList.contains('myreply-button')) {
        let tweetId = e.target.dataset.tweetid
        handleMyReplyBtnClick(tweetId)
    }
})





// ================== HANDLERS ================

function handleLikeClick(tweetId) {

    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked === false) {
        targetTweetObj.likes++
    } else {
        targetTweetObj.likes--
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked

    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))

    render()

}


function handleRetweetClick(tweetId) {

    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--
    } else {
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted

    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))

    render()
}


function handleReplyClick(replyId) {
    document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
}





function handleMyReplyBtnClick(tweetId) {
    // get the reply textarea for the specific tweet
    const replyInput = document.getElementById(`reply-input-${tweetId}`)

    if (!replyInput.value) {
        console.log("you must enter a valid reply")
        return
    }

    // find the tweet (full xrisimi praktiki)
    const targetTweet = tweetsData.find(tweet => tweet.uuid === tweetId)

    if (targetTweet) {
        // create the new reply object
        const newReply = {
            handle: name,
            profilePic: `images/literallyme.jpeg`,
            tweetText: uwuifier.uwuifySentence(replyInput.value),
            uuid: uuidv4()
        }

        //add the reply to the target tweet's replies array
        targetTweet.replies.unshift(newReply)

        replyInput.value = ''

        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))

        render()
    }
}




// handle new tweets manually inputed by user
function handleTweetBtnClick() {

    const tweetInput = document.getElementById(`tweet-input`)

    if (!tweetInput.value) {
        console.log("you must enter a valid string")
    } else {

        console.log(uwuifier.uwuifySentence(tweetInput.value))

        let newTweet = {
            handle: name,
            profilePic: `images/literallyme.jpeg`,
            likes: 0,
            retweets: 0,
            tweetText: `${uwuifier.uwuifySentence(tweetInput.value)}`,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4(),
        }



        //push  them into the array and make them appear in the screen
        tweetsData.unshift(newTweet)
        tweetInput.value = ''

        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))

        render()
    }

}



// handle the deletion of ones tweet
function handleDeleteBtnClick(tweetId) {

    const targetTweet = tweetsData.find(tweet => tweet.uuid === tweetId)
    console.log('targettweet is: ', targetTweet)

    // check if the tweet is mine
    if (!targetTweet || targetTweet.handle !== name){
        console.log('this tweet is not yours')
        return
    }

    if (confirm('Are you sure you want to delete this twink?')){

        // delete the selected tweet by filtering it out of the tweetsData array 
        console.log('this tweet is yours. deleting...')
        tweetsData = tweetsData.filter(tweet => tweet.uuid !== tweetId)
        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))

        render()
    }  
}




function getFeedHtml() {
    let feedHtml = ``



    tweetsData.forEach(function (tweet) {

        //conditional css class switches for likes and retweets
        let likedClass = ''
        let retweetedClass = ''
        if (tweet.isLiked) {
            likedClass = "liked"
        }
        if (tweet.isRetweeted) {
            retweetedClass = "retweeted"
        }




        //handle tweet replies
        let repliesHTML = ""

        let myReply = `
                <div class="myreply" id="myreply">
                    <img src="images/literallyme.jpeg" class="profile-pic" id="reply-profile-pic">
                    <textarea placeholder="ekfrasou elefthera omorfopaido" class="reply-input" id="reply-input-${tweet.uuid}"></textarea>
                    <button class="myreply-button" id="myreply-button" data-tweetid="${tweet.uuid}">Twink</button>
                </div>`

        if (tweet.replies.length > 0) {

            tweet.replies.forEach(function (reply) {
                repliesHTML += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="replied-profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
                </div>
                `
            })
        }


        // check if the reply is made by me and insert it down at the html
        const deleteButtonHtml = tweet.handle === name 
        ? `<i class="delete-tweet" data-delete="${tweet.uuid}">X</i>`
        : '';
        
        
        feedHtml +=
            `
            <div class="tweet">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        
                        ${deleteButtonHtml}
                        
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${likedClass}" data-like="${tweet.uuid}"></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetedClass}" data-retweet="${tweet.uuid}"></i>
                                ${tweet.retweets}
                            </span>
                        </div>   
                    </div>                 
                </div>
                

                
                <div id="replies-${tweet.uuid}">
                    ${myReply}
                    
                    ${repliesHTML} 
                </div>
                
            </div>
        `
    })
    return feedHtml
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml()
}


render()