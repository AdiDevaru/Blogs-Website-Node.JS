const { validateToken } = require("../services/authentication");

function checkCookie(cookieName){
    return (req, res, next) => {
        const cookieValue = req.cookies[cookieName];
        if(!cookieValue) return next();

        try {
            const payLoad = validateToken(cookieValue);
            req.user = payLoad;
        } catch (error) {}
        return next();
    };
}

module.exports = {
    checkCookie,
};