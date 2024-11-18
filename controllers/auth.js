const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false 
    });
};

exports.getSignup = async (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false 
    });
};


exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.redirect('/login');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.redirect('/login');
        }
        // The user is authenticated: update session
        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save(); // to assure that session has been recreated before redirecting
        
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
};

exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.redirect('/signup');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
        });
        await newUser.save();

        res.redirect('/login');
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