const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false 
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const user = await User.findOne();
        req.session.isLoggedIn = true;
        req.session.user = user;
        // to assure that session has been recreated before redirecting
        await req.session.save();
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
};

exports.postLogout = async (req, res, next) => {
    try {
        await req.session.destroy(); 
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
};