const mongodb = require('mongodb');
const { getDb } = require('../utils/database');

class Product {
    constructor(title, imageUrl, description, price, id=null) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this._id = id ? mongodb.ObjectId.createFromHexString(id) : null;
    }

    async save() {
        const db = getDb();
        console.log("this: ", this);
        try {
            if (this._id) {
                // Update the product
                return await db.collection('products').updateOne(
                    { _id: this._id },
                    { $set: this }
                );
            } else {
                // Create a new product
                return await db.collection('products').insertOne(this);
            }
        } catch (err) {
            console.log(err);
        }
    }

    static async fetchAll() {
        const db = getDb();
        try {
            return await db.collection('products').find().toArray();
        } catch (err) {
            console.log(err);
        }
    }

    static async findById (prodId) {
        const db = getDb();
        try {
            return await db.collection('products')
                .findOne({ _id: mongodb.ObjectId.createFromHexString(prodId) });
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteById(prodId) {
        const db = getDb();
        
        try {
            return await db.collection('products')
                .deleteOne({ _id: mongodb.ObjectId.createFromHexString(prodId) });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Product;

