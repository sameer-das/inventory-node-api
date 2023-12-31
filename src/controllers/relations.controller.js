const db = require('../db/dbconnection');
const format = require('pg-format');

const addCustomer = async (req, res, next) => {
    try {
        const _query = 'insert into customer_master (customer_name,customer_phone,customer_gstn) values (%L)';
        const query = format(_query, [req.body.name, req.body.phone, req.body.gstn]);

        const { rows } = await db.query(query);
        res.status(200).json({
            status: 200,
            result: null,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}

const addBiller = async (req, res, next) => {
    try {
        const _query = 'insert into biller_master (biller_name,biller_phone,biller_gstn) values (%L)';
        const query = format(_query, [req.body.name, req.body.phone, req.body.gstn]);

        const { rows } = await db.query(query);
        res.status(200).json({
            status: 200,
            result: null,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}

const getBiller = async (req, res, next) => {
    try {
        const _query = 'select biller_name,biller_phone,biller_gstn from biller_master where status = 1';

        const { rows } = await db.query(_query);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}
const getCustomer = async (req, res, next) => {
    try {
        const _query = 'select customer_name,customer_phone,customer_gstn from customer_master where status = 1';

        const { rows } = await db.query(_query);
        res.status(200).json({
            status: 200,
            result: rows,
            message: null
        });
    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }
}

const searchRelation = async (req, res, next) => {
    const { type, searchValue } = req.query;
    let query;
    if (type === 'biller') {
        query = `select biller_name,biller_phone,biller_gstn from biller_master where status = 1 and (lower(biller_name) like $1 OR biller_phone like $2)`;
    } else if (type === 'customer') {
        query = `select customer_name,customer_phone,customer_gstn from customer_master where status = 1 and (lower(customer_name) like $1 OR customer_phone like $2)`
    }

    try {
        if (searchValue === '') {
            res.status(200).json([]);
        } else {
            const { rows } = await db.query(query, [`%${searchValue.toLowerCase()}%`, `%${searchValue}%`]);
            res.status(200).json(rows);
        }

    } catch (e) {
        res.status(500).json({ status: 500, message: e.message, result: null })
    }

}



module.exports = {
    addCustomer,
    addBiller,
    getBiller,
    getCustomer,
    searchRelation
}