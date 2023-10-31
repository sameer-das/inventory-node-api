const express = require('express');
const cors = require('cors');
const path = require('path');

// ------ ROUTE FILES ------
const userRoutes = require('./routes/user.routes');
const brandRoutes = require('./routes/brand.routes');
const categoryRoutes = require('./routes/category.routes');
const itemRoutes = require('./routes/item.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const saleRoutes = require('./routes/sale.routes')
const relationsRoutes = require('./routes/relations.router')
const authRoutes = require('./routes/auth.router');
const { verifyToken } = require('./controllers/auth.controller');

const app = express();
const PREFIX = '/api/v1';

// ------ COMMON MIDDLEWARES ------
app.use(cors());
app.use(express.json());

// send static files from src/public folder  
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));

// ------ LOGIN ROUTE --------
app.use(PREFIX + '/authenticate', authRoutes);


// ------ API ROUTES, NEEDS AUTHENTIATION ------
app.use(PREFIX + '/users', verifyToken, userRoutes);
app.use(PREFIX + '/brands', verifyToken, brandRoutes);
app.use(PREFIX + '/category', verifyToken, categoryRoutes);
app.use(PREFIX + '/item', verifyToken, itemRoutes);
app.use(PREFIX + '/purchase', verifyToken, purchaseRoutes);
app.use(PREFIX + '/sale', verifyToken, saleRoutes);
app.use(PREFIX + '/relations', verifyToken, relationsRoutes);


// anything else should be routed to angular
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
})

module.exports = app; 