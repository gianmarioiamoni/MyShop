const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

const dotenv = require('dotenv');
dotenv.config();

const { mongoConnect } = require('./utils/database');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// route for 404 error page
app.use(errorController.get404);

const connect = async () => {
    try {
        await mongoConnect();

        app.listen(3300, () => {
            console.log('Server is running on port 3300');
        });
    } catch (err) {
        console.log(err);
    }
}

connect();
    
