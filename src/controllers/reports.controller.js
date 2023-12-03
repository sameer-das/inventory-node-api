
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


const saleReport = async (req, res, next) => {
  const reportType = +req.query.reportType;
  const reportCustomerName = req.query.reportCustomerName;
  const reportItemId = req.query.reportItemId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // console.log(req.query);

  let _query = '';
  let query;
  if (reportType === 1) {
    _query = `select bill_no,sale_uid,sale_date,sale_customer,sale_customer_phone,
      sale_gstn,total_amount,created_on from sale_bill_details where sale_date >= '%s' and sale_date <= '%s' order by created_on`
    query = format(_query, startDate, endDate)
    // console.log(query)
  } else if (reportType === 2) {
    _query = `select bill_no,sale_uid,sale_date,sale_customer,sale_customer_phone,
    sale_gstn,total_amount,created_on from sale_bill_details where sale_date >= '%s' and sale_date <= '%s' and sale_customer = '%s' order by created_on`
    query = format(_query, startDate, endDate, reportCustomerName)
    // console.log(query)
  } else if (reportType === 3) {
    _query = `select item_id,item_name,sale_master.bill_no, 
    sale_customer,sale_customer_phone,sale_gstn,
    sale_master.sale_uid,sale_details_uid,brand_name,
    sale_box_quantity,sale_piece_quantity,sale_total_piece,
    average_sale_price, sale_master.total_amount, 
    gst_earned,profit_earned,sale_master.sale_date,sale_master.created_on    
    from sale_master left join sale_bill_details on sale_master.bill_no =  sale_bill_details.bill_no 
    and sale_master.sale_uid = sale_bill_details.sale_uid
    where sale_master.sale_date >= '%s' and sale_master.sale_date <= '%s' and item_id =%s order by sale_master.created_on`
    query = format(_query, startDate, endDate, reportItemId)
    // console.log(query)
  }


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


const profitReport = async (req, res, next) => {
  const reportType = +req.query.reportType;
  const brandId = req.query.brandId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // console.log(req.query);

  let _query = '';
  let query;
  if (reportType === 1) {
    _query = `select sale_date::date, sum(total_amount) as sale, sum(profit_earned) as profit from sale_master
        where sale_date >= '%s' and sale_date <= '%s'
        group by  sale_date::date order by sale_date::date`
    query = format(_query, startDate, endDate)
    // console.log(query)
  } else if (reportType === 2) {
    _query = `select sale_date::date,sum(total_amount) as sale, sum(profit_earned) as profit from sale_master
        where sale_date >= '%s' and sale_date <= '%s' and brand_id = %s
        group by  sale_date::date order by sale_date::date`
    query = format(_query, startDate, endDate, brandId)
    // console.log(query)
  } else if (reportType === 3) {
    _query = `select brand_name,sum(total_amount) as sale, sum(profit_earned) as profit from sale_master
        where sale_date >= '%s' and sale_date <= '%s'  
        group by  brand_name order by brand_name`
    query = format(_query, startDate, endDate)
    // console.log(query)
  } else if (reportType === 4) {
    _query = `select item_name, sum(total_amount) as sale,	sum(profit_earned) as profit from sale_master
        where sale_date >= '%s' and sale_date <= '%s'
        group by  item_name order by profit desc`
    query = format(_query, startDate, endDate)
    // console.log(query)
  } 


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
  brandWiseStockDetails,
  saleReport,
  profitReport
}