// === check if user is signed in ====
export async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me', {
            credentials: 'include'
        })

        if (!res.ok) {
            console.warn('unexpected response', res.status)
            return false 
        }

        const user = await res.json()
        
        if (!user.isLoggedIn) {
            return false
        }

        name = user.name
        
        return user.name

    } catch (err) {
        console.log(err, 'auth check failed')
        return false
    }
}

// === greet guest if logged off, or user if logged on 
export function renderGreeting(name) {
    const user = name ? name : 'agnwsto poutanaki'
    document.getElementById('greeting').textContent = `kalws irthes, ${user}!`
}

// === only display logout button if logged in, else display login/sign in options
export async function showHideMenuItems(name) {
    const isLoggedIn = name 
    document.getElementById('goto-login-btn').style.display = isLoggedIn ? 'none' : 'inline'
    document.getElementById('goto-signup-btn').style.display = isLoggedIn ? 'none' : 'inline'
    document.getElementById('logout-btn').style.display = isLoggedIn ? 'inline' : 'none'
}
