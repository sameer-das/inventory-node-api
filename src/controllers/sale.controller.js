const db = require('../db/dbconnection');
const { v4: uuidv4 } = require('uuid');
const format = require('pg-format');


const saveSale = async (req, res, next) => {
    const { customerGSTN, customerName, customerPhone, saleDate, billNo, saleItems } = req.body;
    const sale_master_data = [];
    const sale_details_data = [];

    let formated;

    const sale_uid = uuidv4();

    let totalBillAmount = 0;

    if (saleItems.length > 0) {
        formated = saleItems.map(current => {
            const item = {};
            // create item details 

            const sale_details_uid = uuidv4();

            item.itemDetails = {
                sale_uid,
                sale_details_uid,
                item_id: current.item_id,
                brand_id: current.brand_id,
                category_id: current.category_id,
                item_name: current.item_name,
                category_name: current.category_name,
                brand_name: current.brand_name,
                sale_box_quantity: current.qtyBox,
                sale_piece_quantity: current.qtyPiece,
                sale_free_quantity: 0,
                sale_total_piece: current.qtyTotalPiece,
                average_sale_price: +(current.totalAmount / current.qtyTotalPiece).toFixed(2),
                sale_discount: 0,
                total_amount: current.totalAmount,
                gst_earned: 0,
                profit_earned: 0,
                sale_date: saleDate,
                sale_customer: customerName,
                sale_customer_phone: customerPhone,
                sale_gstn: customerGSTN,
            }

            totalBillAmount += +current.totalAmount;

            item.itemStockDetails = [];
            current.stocks.lines.forEach(element => {
                item.itemStockDetails.push({
                    // Item Details
                    sale_uid: sale_uid,
                    sale_details_uid: sale_details_uid,
                    item_id: element.itemDetails.item_id,
                    purchase_id: element.itemDetails.purchase_id,
                    purchase_uid: element.itemDetails.purchaseStockUid,
                    // Sale Quantity
                    sale_box_quantity: element.quantityBox,
                    piece_per_box: element.itemDetails.piecePerCarton,
                    sale_piece_quantity: element.quantityPiece,
                    sale_free_quantity: element.quantityFree,
                    sale_total_piece_quantity: element.itemDetails.totalSaleQuantity,
                    // Purchase Details
                    purchase_price_per_box: element.itemDetails.purchasePricePerPiece * element.itemDetails.piecePerCarton,
                    purchase_price_per_piece: element.itemDetails.purchasePricePerPiece,
                    gst_rate: element.itemDetails.gst,
                    mrp: element.itemDetails.mrp,
                    // Sale Price Details
                    sale_price_per_piece: element.pricePerPiece,
                    sale_price_per_box: element.pricePerBox,
                    average_sale_price_per_piece: element.itemDetails.averageSalePricePerPiece,
                    sale_total_price: element.itemDetails.totalAmount,
                    sale_discount_price: 0,
                    // GST and Profit Earned
                    gst_earned: element.itemDetails.gstEarned,
                    profit_earned: element.itemDetails.profitEarned,
                });

                sale_details_data.push([
                    sale_uid, sale_details_uid, element.itemDetails.item_id, element.itemDetails.purchase_id, element.itemDetails.purchaseStockUid,
                    element.quantityBox, element.itemDetails.piecePerCarton, element.quantityPiece, element.quantityFree, element.itemDetails.totalSaleQuantity,
                    element.itemDetails.purchasePricePerPiece * element.itemDetails.piecePerCarton,
                    element.itemDetails.purchasePricePerPiece, element.itemDetails.gst, element.itemDetails.mrp,
                    element.itemDetails.averageSalePricePerPiece, element.pricePerBox, element.pricePerPiece, element.itemDetails.totalAmount, 0,
                    element.itemDetails.gstEarned, element.itemDetails.profitEarned
                ])

                // calculate total gst and profit for the current line item - item
                item.itemDetails.gst_earned += element.itemDetails.gstEarned;
                item.itemDetails.profit_earned += element.itemDetails.profitEarned;
                // item.itemDetails.sale_discount += element.itemDetails.sale_discount_price;
            });

            item.itemDetailsArray = [
                billNo,
                sale_uid,
                sale_details_uid,
                current.item_id,
                current.brand_id,
                current.category_id,

                current.item_name,
                current.category_name,
                current.brand_name,

                current.qtyBox,
                current.qtyPiece,
                0, // free quantity
                current.qtyTotalPiece,

                +(current.totalAmount / current.qtyTotalPiece).toFixed(2), //avg sale price per piece
                0, // discount
                current.totalAmount,
                item.itemDetails.gst_earned,
                item.itemDetails.profit_earned,
                saleDate]

            // push it to sale_master_data for insertion
            sale_master_data.push(item.itemDetailsArray)
            // Insert into sale_master




            return item;
        })


        //  DB operations
        const client = await db.getClient();

        try {
            const _query0 = `INSERT INTO sale_bill_details (bill_no, sale_uid, sale_date, sale_customer, 
                sale_customer_phone, sale_gstn, total_amount) VALUES (%L)`;

            const query0 = format(_query0, [billNo, sale_uid, saleDate, customerName, customerPhone, customerGSTN, totalBillAmount]);
            // console.log(query0);


            const _query1 = `INSERT INTO sale_master (bill_no, sale_uid, sale_details_uid, item_id, brand_id, category_id, 
                item_name, category_name, brand_name,    
                sale_box_quantity, sale_piece_quantity, sale_free_quantity, sale_total_piece, average_sale_price, 
                sale_discount,total_amount,gst_earned, profit_earned, sale_date) 
                VALUES %L`;
            const query1 = format(_query1, sale_master_data);
            // console.log(query1);

            const _query2 = `INSERT INTO sale_details (sale_uid, sale_details_uid, item_id, purchase_id, purchase_uid,
                sale_box_quantity, piece_per_box, sale_piece_quantity, sale_free_quantity, sale_total_piece_quantity,  
                purchase_price_per_box, purchase_price_per_piece, gst_rate, mrp,  
                average_sale_price_per_piece, sale_price_per_box, sale_price_per_piece, sale_total_price, sale_discount_price,  
                gst_earned, profit_earned) VALUES %L`
            const query2 = format(_query2, sale_details_data);
            // console.log(query2);

            const _query3 = `UPDATE item_master SET total_quantity = total_quantity - sale_master.sale_total_piece FROM sale_master 
                WHERE item_master.item_id = sale_master.item_id AND sale_master.sale_uid = '%s'`

            const query3 = format(_query3, sale_uid);
            // console.log(query3);


            const _query4 = `UPDATE stock_master SET total_quantity_piece = total_quantity_piece - sale_details.sale_total_piece_quantity
                FROM sale_details WHERE sale_details.purchase_uid = stock_master.uid and sale_details.purchase_id = stock_master.purchase_id and 
                sale_details.sale_uid = '%s'`;
            const query4 = format(_query4, sale_uid)

            await client.query('BEGIN');

            const saleBillDetailsResp = await client.query(query0);
            const saleMasterResp = await client.query(query1);
            const saleDetailsResp = await client.query(query2);
            const itemMasterResp = await client.query(query3);
            const stockMasterResp = await client.query(query4);

            await client.query('COMMIT');

            res.status(200).json({
                status: 200,
                result: billNo,
                message: null
            })
        } catch (e) {
            console.log(e);
            await client.query('ROLLBACK');
            res.status(500).json({
                status: 200,
                result: null,
                message: e.message
            })
        } finally {
            await client.release();
        }

    } else {
        res.status(400).json({
            status: 400,
            result: null,
            message: 'No items found for sale!'
        })
    }

}


const getNextBillNumber = async (req, res, next) => {
    current_date = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const _query = `SELECT bill_no FROM sale_bill_details where (created_on  + interval '5.5 hours') :: date = '%s' ORDER BY created_on DESC LIMIT 1`;
    const query = format(_query, current_date);
    // console.log(query)
    try {
        const { rows } = await db.query(query);
        if (rows.length === 0) {
            // console.log('no bill has been generated for the day')
            res.status(200).json({
                status: 200,
                result: current_date.split('-').join('') + '0001',
                message: null
            })
        } else {
            // console.log(rows)
            const latest_bill_no = rows[0].bill_no.slice(8);
            res.status(200).json({
                status: 200,
                result: current_date.split('-').join('') + String(+latest_bill_no + 1).padStart(4, '0'),
                message: null
            })
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            result: null,
            message: e.message
        })
    }
}

const getSales = async (req, res, next) => {
    const query = `SELECT bill_no, sale_uid,sale_date,sale_customer,sale_customer_phone, 
    sale_gstn,sale_customer, total_amount FROM sale_bill_details WHERE status = 1`;
    try {
        const { rows } = await db.query(query);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        })
    } catch (e) {
        res.status(500).json({
            status: 500,
            result: null,
            message: e.message
        })
    }

}

const getSaleDetails = async (req, res, next) => {
    const _query = `SELECT sale_bill_details.bill_no,sale_bill_details.sale_uid,sale_details_uid,
        item_id,brand_id, category_id,
        item_name,category_name,brand_name, 
        sale_box_quantity,sale_piece_quantity,sale_free_quantity,sale_total_piece,
        average_sale_price,sale_discount,sale_master.total_amount, gst_earned,profit_earned,
        sale_bill_details.sale_date,
        sale_customer, sale_customer_phone,sale_gstn        
        FROM sale_master INNER JOIN sale_bill_details ON sale_master.sale_uid = sale_bill_details.sale_uid
        WHERE sale_bill_details.sale_uid = '%s'`;
    const query = format(_query, [req.query.saleUid])

    try {
        const { rows } = await db.query(query);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        })
    } catch (e) {
        res.status(500).json({
            status: 500,
            result: null,
            message: e.message
        })
    }
}

const getGstDetailsOfSale = async (req, res, next) => {
    const _query = `SELECT gst_rate,sum(gst_earned) FROM sale_details 
        WHERE sale_uid='%s' GROUP BY gst_rate`;
    const query = format(_query, [req.query.saleUid]);
    try {
        const { rows } = await db.query(query);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        })
    } catch (e) {
        res.status(500).json({
            status: 500,
            result: null,
            message: e.message
        })
    }
}

module.exports = {
    saveSale,
    getNextBillNumber,
    getSales,
    getSaleDetails,
    getGstDetailsOfSale
}