const express = require('express');
const bodyParser = require('body-parser');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const path = require('path');

const app = express();

app.set('view engine', 'ejs'); // templates engine to be uses
app.set('views', 'views'); // where to find dynamics views; /views is default

app.use(bodyParser.urlencoded({ extended: false }));
// static served files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin',adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.render('404', {pageTitle: 'Page Not Found', path: null});
});


app.listen(3300, () => {
    console.log("Listening on port 3300");
});