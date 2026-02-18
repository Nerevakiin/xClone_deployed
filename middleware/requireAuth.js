export function requireAuth(req, res, next) {
    // The ?. prevents the "Cannot read property of undefined" crash
    if (req.session?.userId) {
        next()
    } else {
        res.status(401).json({ error: 'Unauthorized' })
    }
}