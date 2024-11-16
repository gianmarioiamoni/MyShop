const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const DB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
console.log("DB_URL: ", DB_URL);

let _db;

const mongoConnect = async () => {
    try {
        const client = await MongoClient.connect(DB_URL);
        console.log('Connected to MongoDB');
        _db = client.db('MyShop');
        return _db;
    } catch (err) {
        console.log(err);
        return null;
    }
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
