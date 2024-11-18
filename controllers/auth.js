const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const getMessage = require('../util/getMessage');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));
console.log("sendgrid API key: ", process.env.SENDGRID_API_KEY);

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: getMessage(req, 'error'), // error is the key in req.flash()
    });
};

exports.getSignup = async (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: getMessage(req, 'error')
    });
};


exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            req.flash('error', 'Invalid email or password.');
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
            req.flash('error', 'Email already existing.');
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

        // send confirmation email
        await transporter.sendMail({
            to: email,
            from: 'gianmario.iamoni@gmail.com',
            subject: 'Successfully signed up!',
            html: '<h1>You successfully signed up!</h1>'
        });
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

// RESET PASSWORD
exports.getReset = async (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: getMessage(req, 'error')
    });
}

exports.postReset = async (req, res, next) => {
    try {
        const buffer = crypto.randomBytes(32);
        const token = buffer.toString('hex');
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'No account with that email found.');
            return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        // send email
        await transporter.sendMail({
            to: req.body.email,
            from: 'gianmario.iamoni@gmail.com',
            subject: 'Password reset',
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3300/reset/${token}">link</a> to set a new password.</p>
            `
        });

        res.redirect('/login');

    } catch (err) {
        console.log(err);
    }
}

exports.getNewPassword = async (req, res, next) => {    
    const token = req.params.token;
    try {
        // Check if a user for that token exists
        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: getMessage(req, 'error'),
            userId: user._id.toString(),
            passwordToken: token
        });
    } catch (err) {
        console.log(err);
    }
}

exports.postNewPassword = async (req, res, next) => {
    const {newPassword, userId, passwordToken} = req.body;
    
    try {
        // assign a new password to the user with the right token and _id
        const user = await User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        });
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
}