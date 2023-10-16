
const db = require('../db/dbconnection');
const format = require('pg-format');

const addPurchase = async (purchasePayload) => {
    const client = await db.getClient();
    let result;
    try {
        // insert to the purchase_master table
        const values = [];
        purchasePayload.forEach(current => {
            values.push([
                current.purchase_date, current.biller_name, current.biller_gstn,
                current.item_id, current.category_id, current.brand_id,
                current.item_name, current.category_name, current.brand_name,
                current.barcode, current.mrp,
                current.quantityBox, current.piecePerCarton, current.quantityPiece, current.quantityFree,
                current.purchasePriceBeforeDiscount, current.discountPrice, current.purchasePriceAfterDiscount,
                current.gst, current.totalQuantityPiece, current.taxAmount, current.totalPrice, current.purchasePricePerPiece
            ])
        });
        const _query1 = `insert into purchase_master (purchase_date, biller_name, biller_gstn,
        item_id, category_id, brand_id,
        item_name, category_name, brand_name,
        barcode, mrp,
        quantity_box, piece_per_carton, quantity_piece, quantity_free,
        purchase_price_before_discount, discount_price, purchase_price_after_discount,
        gst, total_quantity_piece, tax_amount, total_price, purchase_price_per_piece) values %L returning purchase_id`;

        const query1 = format(_query1, values);
        // console.log(query);

        await client.query('BEGIN');

        const purchaseMasterResp = await client.query(query1);
        const purchase_ids = purchaseMasterResp.rows.map(c => c.purchase_id);
        // console.log(purchase_ids);


        // insert to the stock_master table

        const _query2 = `insert into stock_master (purchase_id, item_id , category_id, brand_id,
            item_name, category_name, brand_name, barcode, mrp, total_quantity_piece,
            piece_per_carton, purchase_price_per_piece) 
            select purchase_id, item_id, category_id, brand_id, item_name,
            category_name, brand_name, barcode, mrp, total_quantity_piece, piece_per_carton, purchase_price_per_piece  
            from purchase_master where purchase_master.purchase_id in (%L)`
        const query2 = format(_query2, purchase_ids);
        // console.log(query2);
        const stockMasterResp = await client.query(query2);
        // console.log(stockMasterResp);

        // increase the qty in item_master table 

        const _query3 = `UPDATE item_master SET total_quantity = total_quantity + purchase_master.total_quantity_piece
        FROM purchase_master WHERE item_master.item_id = purchase_master.item_id AND purchase_master.purchase_id in (%L)`

        const query3 = format(_query3, purchase_ids);
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


module.exports = {
    addPurchase
}