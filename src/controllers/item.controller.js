
const db = require('../db/dbconnection');
const format = require('pg-format');

const getAllItems = async (req, res, next) => {
    try {
        const _query = `select item_master.category_id, item_master.brand_id,item_master.item_id,
                item_name,category_name,brand_master.name as brand_name, total_quantity, barcode from item_master
                inner join category_master on item_master.category_id = category_master.category_id
                inner join brand_master on item_master.brand_id = brand_master.brand_id
                where item_master.status = $1 `
        const { rows } = await db.query(_query, [req.query.status || 1]);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}

const getAllItemsOfABrand = async (req, res, next) => {
    try {
        const _query = `select item_master.category_id, item_master.brand_id,item_master.item_id,
                item_name,category_name,brand_master.name as brand_name, total_quantity, barcode from item_master
                inner join category_master on item_master.category_id = category_master.category_id
                inner join brand_master on item_master.brand_id = brand_master.brand_id
                where item_master.status = 1 and item_master.brand_id = $1 `
        const { rows } = await db.query(_query, [req.query.brandId]);
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

const searchItemWithStock = async (req, res, next) => {
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
            WHERE item_master.status = $1 AND stock_master.total_quantity_piece >= 0 AND lower(item_master.item_name) like $2`;

            const { rows } = await db.query(q, [req.query.status || 1, `%${req.query.search.toLowerCase()}%`]);
            res.status(200).json(rows);
        }
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}


const itemStockDetails = async (req, res, next) => {
    try {
        const _query = `select stock_id,stock_master.purchase_id, stock_master.uid as purchase_uid,
                stock_master.item_id, stock_master.category_id,stock_master.category_id,
                stock_master.item_name, stock_master.category_name,stock_master.brand_name, stock_master.barcode, stock_master.mrp, stock_master.total_quantity_piece, 
                stock_master.piece_per_carton, stock_master.purchase_price_per_piece,stock_master.created_on,purchase_date from stock_master
                inner join purchase_master on stock_master.item_id = purchase_master.item_id
                and stock_master.purchase_id = purchase_master.purchase_id
                where stock_master.item_id = %s`;
        const query = format(_query, [req.query.itemId]);
        // console.log(query);
        const { rows } = await db.query(query);
        res.status(200).json({ status: 200, message: null, result: rows });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null });
    }
}

const getStockWorthBrandWise = async (req, res, next) => {
    const _query = `select brand_master.name as brand_name,brand_master.brand_id,
            case when temp.total_stock is null then 0 else temp.total_stock end 
            from brand_master left join (select  stock_master.brand_id, stock_master.brand_name, 
            sum(stock_master.total_quantity_piece * stock_master.purchase_price_per_piece) as total_stock
            from stock_master
            inner join purchase_master on stock_master.item_id = purchase_master.item_id
            and stock_master.purchase_id = purchase_master.purchase_id 
            group by stock_master.brand_name, stock_master.brand_id) temp
            on brand_master.brand_id = temp.brand_id order by brand_master.name`;
    try {
        const { rows } = await db.query(_query);
        res.status(200).json({ status: 200, message: null, result: rows });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null });
    }
}

module.exports = {
    getAllItems,
    createItem,
    searchItem,
    searchItemWithStock,
    itemStockDetails,
    getStockWorthBrandWise,
    getAllItemsOfABrand
}