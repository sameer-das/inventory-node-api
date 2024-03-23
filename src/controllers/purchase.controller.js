
const db = require('../db/dbconnection');
const format = require('pg-format');
const { v4: uuidv4 } = require('uuid');

const addPurchase = async (purchasePayload) => {
    const client = await db.getClient();
    let result;
    const uid = uuidv4();
    console.log(uid);
    console.log(purchasePayload);
    try {
        // insert to the purchase_bill_details 
        const _query0 = `INSERT INTO purchase_bill_details 
        (purchase_uid, purchase_date, biller_name, biller_phone, biller_gstn, total_price)
        VALUES (%L)`;
        const purchase_bill_details = [uid, purchasePayload[0].purchase_date,
            purchasePayload[0].biller_name, purchasePayload[0].biller_phone || '', purchasePayload[0].biller_gstn];

        // insert to the purchase_master table
        const values = [];
        let totalBillAmount = 0;
        purchasePayload.forEach(current => {
            values.push([
                current.purchase_date, uid, current.biller_name, current.biller_gstn,
                current.item_id, current.category_id, current.brand_id,
                current.item_name, current.category_name, current.brand_name,
                current.barcode, current.mrp,
                current.quantityBox, current.piecePerCarton, current.quantityPiece, current.quantityFree,
                current.purchasePriceBeforeDiscount, current.discountPrice, current.purchasePriceAfterDiscount,
                current.gst, current.totalQuantityPiece, current.taxAmount, current.totalPrice, current.purchasePricePerPiece
            ]);
            totalBillAmount = +(+totalBillAmount + +current.totalPrice).toFixed(2)
        });
        purchase_bill_details.push(totalBillAmount);
        const query0 = format(_query0, purchase_bill_details);
        console.log(query0);

        const _query1 = `insert into purchase_master (purchase_date, uid, biller_name, biller_gstn,
        item_id, category_id, brand_id,
        item_name, category_name, brand_name,
        barcode, mrp,
        quantity_box, piece_per_carton, quantity_piece, quantity_free,
        purchase_price_before_discount, discount_price, purchase_price_after_discount,
        gst, total_quantity_piece, tax_amount, total_price, purchase_price_per_piece) values %L returning purchase_id`;

        const query1 = format(_query1, values);
        console.log(query1);
        await client.query('BEGIN');

        const purchaseBillDetailsResp = await client.query(query0);
        const purchaseMasterResp = await client.query(query1);
        const purchase_ids = purchaseMasterResp.rows.map(c => c.purchase_id);
        // console.log(purchase_ids);


        // insert to the stock_master table

        const _query2 = `insert into stock_master (purchase_id, uid, item_id , category_id, brand_id,
            item_name, category_name, brand_name, barcode, mrp, total_quantity_piece,
            piece_per_carton, purchase_price_per_piece) 
            select purchase_id, uid, item_id, category_id, brand_id, item_name,
            category_name, brand_name, barcode, mrp, total_quantity_piece, piece_per_carton, purchase_price_per_piece  
            from purchase_master where purchase_master.uid = '%s'`
        const query2 = format(_query2, uid);
        console.log(query2);
        const stockMasterResp = await client.query(query2);
        // console.log(stockMasterResp);

        // increase the qty in item_master table 

        const _query3 = `UPDATE item_master SET total_quantity = total_quantity + purchase_master.total_quantity_piece
        FROM purchase_master WHERE item_master.item_id = purchase_master.item_id AND purchase_master.uid = '%s'`

        const query3 = format(_query3, uid);
        console.log(query3)
        const itemMasterResp = await client.query(query3);

        await client.query('COMMIT');
        result = {
            status: 200,
            result: null,
            message: null
        }
    } catch (e) {
        result = {
            status: 500,
            result: null,
            message: e.message
        }
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
    return result;
}


const getAllPurchases = async (req, res, next) => {
    // console.log(req.query)
    let _query;
    if (Object.keys(req.query).length === 0) {
        console.log('No query params')
        _query = `select sl_id,purchase_uid,purchase_date,biller_name,biller_phone,
        biller_gstn, total_price, created_on from purchase_bill_details order by created_on desc`

    } else {
        _query = `select sl_id,purchase_uid,purchase_date,biller_name,biller_phone,
        biller_gstn, total_price, created_on, count(*) OVER() as total_count from purchase_bill_details order by created_on desc offset ${(req.query.page - 1) * req.query.pageSize} limit ${req.query.pageSize}`
    }

    try {
        const { rows } = await db.query(_query);
        res.status(200).json({ status: 200, message: null, result: rows });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null });
    }
}

const getPurchaseDetails = async (req, res, next) => {
    // 
    const _query = `SELECT purchase_id,uid,pm.purchase_date as purchase_date,
        pbd.biller_name, pbd.biller_phone, pbd.biller_gstn,
        item_id,category_id,brand_id, item_name, category_name, brand_name,barcode,
        mrp,quantity_box, piece_per_carton, quantity_piece, quantity_free,
        purchase_price_before_discount, discount_price,
        purchase_price_after_discount, gst, total_quantity_piece, tax_amount, pm.total_price,	
        purchase_price_per_piece, pm.created_on
        FROM purchase_master pm 
        INNER JOIN purchase_bill_details pbd ON pm.uid = pbd.purchase_uid
        WHERE uid = '%s'`

    const query = format(_query, [req.query.purchase_uid])

    try {
        const { rows } = await db.query(query);
        res.status(200).json({ status: 200, message: null, result: rows });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null });
    }
}

module.exports = {
    addPurchase,
    getAllPurchases,
    getPurchaseDetails
}