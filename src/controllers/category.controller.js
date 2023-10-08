
const db = require('../db/dbconnection');


const getAllCategories = async (req, res, next) => {
    try {
        const { rows } = await db.query('select category_id, category_name from category_master where status = $1', [req.query.status || 1]);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


const createCategory = async (req, res, next) => {
    try {
        const resp = await db.query('insert into category_master (category_name,status,createdon) values ($1,$2,now())', [req.body.categoryName, 1]);
        res.status(201).json({
            status: 201,
            result: resp.rowCount,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


module.exports = {
    getAllCategories,
    createCategory
}