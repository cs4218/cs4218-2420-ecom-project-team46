import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import { EJSON } from 'bson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure env
dotenv.config({ path: path.join(__dirname, '../.env') });
//console.log(path.join(__dirname, '../.env'));

try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    //console.log(`Connected To Mongodb Database ${conn.connection.host}`);
} catch (error) {
    console.log(`Error in Mongodb ${error}`);
}

async function clearAndLoadCollection(collectionName, jsonFilePath) {
    const collection = mongoose.connection.collection(collectionName);
  
    try {
        await collection.deleteMany({});
        //console.log(`Cleared collection: ${collectionName}`);
    
        const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
        const data = EJSON.parse(fileContent);
    
        if (Array.isArray(data)) {
            const result = await collection.insertMany(data);
            //console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
        } else {
            await collection.insertOne(data);
            //console.log(`Inserted 1 document into ${collectionName}`);
        }
    } catch (error) {
        console.error(`Error processing collection ${collectionName}:`, error);
    }
}

async function main() {
    const collections = [
       { name: 'categories', file: path.join(__dirname, './sample-data/test.categories.json') },
       { name: 'orders', file: path.join(__dirname, './sample-data/test.orders.json') },
       { name: 'products', file: path.join(__dirname, './sample-data/test.products.json') },
       { name: 'users', file: path.join(__dirname, './sample-data/test.users.json') },
    ];
  
    for (const { name, file } of collections) {
       await clearAndLoadCollection(name, file);
    }

    mongoose.connection.close();
}

main().catch((err) => {
    console.error('Error running script:', err);
});