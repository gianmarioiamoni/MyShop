const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const dotenv = require('dotenv');
dotenv.config();

const DB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
console.log("DB_URL: ", DB_URL);

const PORT = process.env.PORT || 3300;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('67392f1ff99c63cf06327c1e')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const connect = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to MongoDB');

    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'gianma67',
          email: 'gianma67@gmail.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });

    app.listen(PORT,
      () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
};

connect();