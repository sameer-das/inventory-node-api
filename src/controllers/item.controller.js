
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
        if (!req.query.search) {
            res.status(200).json([]); // return empty array
        }
        else {
            const q = `select item_id, i.category_id, i.brand_id, item_name, category_name , b.name as brand_name, total_quantity, barcode, i.status
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

const searchItemWithStock = async (req,res,next) => {
    try {
        if (!req.query.search) {
            res.status(200).json([]); // return empty array
        }
        else {
            const q = `SELECT 
            item_master.item_id,item_master.category_id, item_master.brand_id,
            item_master.item_name,stock_master.category_name,stock_master.brand_name,
            item_master.total_quantity,item_master.barcode,
            stock_master.purchase_id,stock_master.uid,stock_master.mrp,
            stock_master.total_quantity_piece, stock_master.piece_per_carton,stock_master.purchase_price_per_piece,
            purchase_master.gst, purchase_master.purchase_date
            FROM item_master 
            INNER JOIN stock_master ON item_master.item_id = stock_master.item_id
            INNER JOIN  purchase_master ON stock_master.item_id = purchase_master.item_id 
            AND stock_master.uid = purchase_master.uid           
            WHERE item_master.item_id = 7 AND item_master.status=1 AND stock_master.total_quantity_piece > 0 AND lower(item_master.item_name) like $1`;

            const { rows } = await db.query(q, [`${req.query.search.toLowerCase()}%`]);
            res.status(200).json(rows);
        }
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


module.exports = {
    getAllItems,
    createItem,
    searchItem,
    searchItemWithStock
}