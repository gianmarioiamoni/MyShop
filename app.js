const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const dotenv = require('dotenv');
dotenv.config();

const errorController = require('./controllers/error');
const User = require('./models/user');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
console.log("DB_URI: ", DB_URI);

const PORT = process.env.PORT || 3300;

const app = express();
const store = new MongoDBStore({
  uri: DB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

// CSRF Token setting
// To be done before anything can go wrong
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async(req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) { 
    next(new Error(err));
  }
});

// Routes registration
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// Error handling middleware
app.use((error, req, res, next) => {
  console.log("Error middleware - Error: ", error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

const connect = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT,
      () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
};

connect();

