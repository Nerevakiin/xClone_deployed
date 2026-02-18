const loginForm = document.getElementById('login-form')
const errorMessage = document.getElementById('error-message')

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault() // prevent form from reloading the page

    const username = document.getElementById('login-username').value.trim()
    const password = document.getElementById('login-password').value.trim()
    const submitBtn = document.getElementById('login-btn')

    errorMessage.textContent = '' // clear old error msges
    submitBtn.disabled = true

    try {

        // 1. hit the endpoint that we must hit with the proper information
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({username, password}) // create the body by stringifying the necessary info that we send
        })

        const data = await res.json() // put it into 'data' and send it! 

        if (res.ok) {
            window.location.href = '/'
        } else {
            errorMessage.textContent = data.error || 'login failed. please try again'
        } 

    } catch (err) {
        console.error('issue with login front end side', err)
        errorMessage.textContent = 'unable to connect'
    } finally {
        submitBtn.disabled = false
    }
})