const express = require('express');
const cors = require('cors');

// ------ ROUTE FILES ------
const userRoutes = require('./routes/user.routes');
const brandRoutes = require('./routes/brand.routes');
const categoryRoutes = require('./routes/category.routes');
const itemRoutes = require('./routes/item.routes');

const app = express();
const PREFIX = '/api/v1';

// ------ COMMON MIDDLEWARES ------
app.use(cors()); 
app.use(express.json());


// ------ API ROUTES ------
app.use(PREFIX + '/users', userRoutes);
app.use(PREFIX + '/brands', brandRoutes);
app.use(PREFIX + '/category', categoryRoutes);
app.use(PREFIX + '/item', itemRoutes);

module.exports = app; 