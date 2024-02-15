// routes.js
import express from 'express';
import { controllers, userControl } from '../controllers/controllers.js';
import { commonHeaders, basicAuth } from '../Middleware/middleware.js';


const router = express.Router();


// Middleware specifically for GET /healthz & no body and params
function validateHealthzRequest(req, res, next) {
    if (req.headers['content-length'] && req.headers['content-length'] !== '0' || Object.keys(req.query).length!==0) {
        return res.status(400).header(commonHeaders()).send();
    }
    next();
}
//posting the user
router.post('/v1/user', userControl.newUser)
// GET request handler for /healthz
router.get('/healthz', validateHealthzRequest, controllers.connectionCheck);


//Getting the user
router.get('/v1/user/self',validateHealthzRequest, basicAuth,userControl.getUser,);

//updating the user details
router.put('/v1/user/self', basicAuth, userControl.updateUser,async (req, res) => {
    if(Object.keys(req.query).length !== 0){
      return res.status(400).header('Cache-Control', 'no-cache').json({ message: 'parameters are not allowed in header' });
    }})

// Catch-all route for 404 Not Found responses
router.all('*', (req, res) => {
    res.set(commonHeaders()).status(404).send('');
});

export default router;
