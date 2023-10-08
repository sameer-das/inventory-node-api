const db = require('../db/dbconnection');

const getAllUsers = async (req, res) => {
    try {
        const { rows } = await db.query('select * from user_master');
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}
const getUser = async (req, res) => {
    try {
        const { rows } = await db.query('select user_id,user_name,phone from user_master where user_name=$1 and password=$2', [req.body.username, req.body.password]);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}



module.exports = {
    getAllUsers,
    getUser
}