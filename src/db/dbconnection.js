const { Pool } = require('pg')
const connectionString = 'postgres://sameer-das:31CEBKguldic@ep-wispy-morning-51772731.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
const pool = new Pool({
    connectionString
})

const query = (text, params, callback) => {
    return pool.query(text, params, callback)
}

module.exports = {query};