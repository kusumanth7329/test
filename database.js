// database.js
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import mysql from "mysql2/promise";
 
dotenv.config();

const database = process.env.databaseName;
const username = process.env.databaseUser;
const password = process.env.databasePassword;
const host = process.env.host;
const port = process.env.databasePort || 3306;
const dialect = 'mysql';
 

try{
    const dbConnect = await mysql.createConnection({
        host: process.env.host,
        port: process.env.databasePort || 3306,
        user: process.env.databaseUser,
        password: process.env.databasePassword
    });
     
    await dbConnect.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
     
    await dbConnect.end();
} catch(error){

}

 
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    port: port,
    logging: false,
});

export default sequelize;
