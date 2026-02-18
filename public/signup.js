const signupForm = document.getElementById('signup-form')
const errorMessage = document.getElementById('error-message')

signupForm.addEventListener('submit', async (e) => {
    
    e.preventDefault() // prevent form from reloading

    const name = document.getElementById('signup-fullname').value.trim()
    const email = document.getElementById('signup-email').value.trim()
    const username = document.getElementById('signup-username').value.trim()
    const password = document.getElementById('signup-password').value.trim()
    const submitBtn = document.getElementById('signup-btn')

    errorMessage.textContent = '' // clear old errors
    submitBtn.disabled = true

    try {

        const res = await fetch('api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, username, password })
        })

        const data = await res.json()

        if (res.ok){
            window.location.href = '/'
            console.log(data)
        } else {
            errorMessage.textContent = data.error || 'registration failed. please try again' 
        }

    } catch (err) {
        console.error('network error: ', err)
        errorMessage.textContent = 'Unable to connect, please try again'
    } finally {
        submitBtn.disabled = false
    }


})