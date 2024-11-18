const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

const crsfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const dotenv = require('dotenv');
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
console.log("DB_URI: ", DB_URI);

const PORT = process.env.PORT || 3300;

const store = new MongoDBStore({
  uri: DB_URI,
  collection: 'sessions'
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(crsfProtection);
app.use(flash());
app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});
// Authentication and CSRF protection
app.use((req, res, next) => {
  // res.locals stores local variables that will be passed to the views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

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