export const attachUser = (req, res, next) => {
    const userId = req.headers["x-user-id"]
    const phone = req.headers["x-user-phone"]

    if (userId && phone) {
        req.user = {
            id: String(userId),
            phone: String(phone)
        }
    }

    next()
}
