const jwt = require('jsonwebtoken');
const SECRET_KEY = 'inventorysecretkey';
const db = require('../db/dbconnection');


const authenticate = async (req, res, next) => {
    try {
        const query = `SELECT name, phone, user_name,status, user_id FROM user_master WHERE user_name = $1 AND password = $2 limit 1`
        const { rows } = await db.query(query, [req.body.username, req.body.password]);
        if (rows.length === 0) {
            res.status(404).json({ status: 404, message: `Invalid credentials!`, result: null })
        } else {
            jwt.sign(rows[0], SECRET_KEY, { expiresIn: '168h' }, (err, token) => {
                if(err) {
                    console.log(err.message)
                    res.status(500).json({ status: 500, message: `Error while creating authentication token.`, result: token })
                }
                res.status(200).json({ status: 200, message: `Authentication successfull.`, result: token })
            })
        }
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
    const user = {
        username: 'admin',
        password: 'admin'
    }
}


const verifyToken = async (req, res, next) => {
    // console.log(req.headers)
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ status: 401, message: 'Autherization token not found', result: null });
    } else {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(401).json({ status: 401, message: 'Invalid autherization token.', result: null });
            }
            req.user = user;
            next();
        })
    }
}
module.exports = {
    authenticate,
    verifyToken
} 