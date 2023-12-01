
const db = require('../db/dbconnection');
const format = require('pg-format');


const saleDetails = () => {
    const query = `SELECT sm.bill_no, sm.sale_uid, sm.sale_details_uid,sm.item_id,
    sm.item_name,sm.category_name,sm.brand_name,
    sd.sale_box_quantity,sd.piece_per_box,sd.sale_piece_quantity, sd.sale_total_piece_quantity,
    sd.purchase_price_per_piece, sd.gst_rate,sd.mrp,
    sd.average_sale_price_per_piece,sd.sale_price_per_box,sd.sale_price_per_piece,
    sd.sale_total_price,sd.profit_earned,sd.gst_earned    
    FROM
    sale_master sm INNER JOIN  sale_details sd 
      ON sm.sale_uid = sd.sale_uid AND sm.sale_details_uid = sd.sale_details_uid 
      AND sm.item_id = sd.item_id
    WHERE sm.sale_uid = 'bc1f034f-cd08-4613-8064-17b7c6518e54' AND
    (sd.sale_box_quantity != 0 OR sd.sale_piece_quantity != 0) ORDER BY sm.item_name`
}


const brandWiseStockDetails = async (req, res, next) => {
  const query = `select item_id,item_name,piece_per_carton, sum(total_quantity_piece) 
  from stock_master where brand_id = ${req.query.brandId} and total_quantity_piece != 0 group by item_id,item_name,piece_per_carton
  order by item_name`

  // const query = format(_query, [req.query.saleUid])

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
  brandWiseStockDetails
}