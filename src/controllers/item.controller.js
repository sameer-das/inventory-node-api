
const db = require('../db/dbconnection');


const getAllItems = async (req, res, next) => {
    try {
        const { rows } = await db.query('select category_id, brand_id, item_name, total_quantity, barcode from item_master where status = $1', [req.query.status || 1]);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


const createItem = async (req, res, next) => {
    try {
        const params = [req.body.categoryId, req.body.brandId, req.body.itemName, req.body.barCode];
        const resp = await db.query('insert into item_master (category_id, brand_id, item_name, total_quantity, barcode, createdon,status) values ($1,$2,$3,0,$4,now(),1)', params);
        res.status(201).json({
            status: 201,
            result: resp.rowCount,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}

const searchItem = async (req, res, next) => {
    try {
        if (!req.query.search){
            res.status(200).json([]); // return empty array
        }
        else{
            const  q = `select item_id, i.category_id, i.brand_id, item_name, category_name , b.name as brand_name, total_quantity, barcode, i.status
            from item_master i,
            brand_master b,
            category_master c where i.category_id = c.category_id and i.brand_id = b.brand_id and i.status = $1 and lower(i.item_name) like $2`
            const { rows } = await db.query(q, [req.query.status || 1, `${req.query.search.toLowerCase()}%`]);
            res.status(200).json(rows);
        }
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


module.exports = {
    getAllItems,
    createItem,
    searchItem
}