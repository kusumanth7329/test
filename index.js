// index.js
import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './database.js';
import routes from './Routes/routes.js';
import { handleNonGetReq, dbCheck } from './Middleware/middleware.js';
import './models/users.js';
const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
// Global Middleware
app.use(bodyParser.urlencoded({ extended: true }));

//check the database connection 
app.use('/v1',dbCheck);
// Use the handleNonGetReq middleware for /healthz
app.use(handleNonGetReq);

// Routes
app.use(routes);

//Sequelize Database Synchronization and Server Start
// sequelize.sync().then(() => {
//     app.listen(port, () => {
//         console.log(`Server running on http://localhost:${port}`);
//     });
// }).catch((err) => {
//     console.error('Unable to sync database:', err);
//     process.exit(1);
// });

async function Index() {
    try {
      await sequelize.sync();
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Unable to sync database:', error);
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    }
  }
Index();
  
export default app;
