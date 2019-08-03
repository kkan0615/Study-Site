exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('Login is required');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

exports.isAdmain = (req, res, next) => {
    if(req.user && req.user.isAdmin == true) {
        next();
    } else {
        console.log(req.user);
        res.status(402).send('You are not allowed to access, Admin only');
    }
}