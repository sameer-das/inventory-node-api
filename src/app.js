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

const app = express();
const PREFIX = '/api/v1';

// ------ COMMON MIDDLEWARES ------
app.use(cors()); 
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'),{ redirect: false }));

// ------ API ROUTES ------
app.use(PREFIX + '/users', userRoutes);
app.use(PREFIX + '/brands', brandRoutes);
app.use(PREFIX + '/category', categoryRoutes);
app.use(PREFIX + '/item', itemRoutes);
app.use(PREFIX + '/purchase', purchaseRoutes);
app.use(PREFIX + '/sale', saleRoutes);


app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname,'/public/index.html'));
})

module.exports = app; 