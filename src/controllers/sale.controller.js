const db = require('../db/dbconnection');
const { v4: uuidv4 } = require('uuid');

const saveSale = (sale) => {
    const { customerGSTN, customerName, saleDate, saleItems } = sale;

    let formated;
    if (saleItems.length > 0) {
        formated = saleItems.map(current => {
            const item = {};
            // create item details 
            const sale_uid = uuidv4();
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
                gst_earned: 0,
                profit_earned: 0,
                sale_date: saleDate,
                sale_customer: customerName,
                sale_gstn: customerGSTN,
                
            }

            item.itemStockDetails = [];
            current.stocks.lines.forEach(element => {
                item.itemStockDetails.push({
                    // Item Details
                    sale_details_uid: sale_details_uid,
                    item_id: element.itemDetails.item_id,
                    purchase_id: element.itemDetails.purchase_id,
                    purchase_uid: element.itemDetails.purchaseStockUid,
                    // Sale Quantity
                    sale_box_quantity: element.quantityBox,
                    sale_piece_quantity: element.quantityPiece,
                    sale_free_quantity: element.quantityFree,
                    sale_total_piece_quantity: element.itemDetails.totalSaleQuantity,
                    // Purchase Details
                    purchase_price_per_box: element.itemDetails.purchasePricePerPiece * element.itemDetails.piecePerCarton,
                    purchase_price_per_piece: element.itemDetails.purchasePricePerPiece,
                    mrp: element.itemDetails.mrp,
                    gst_rate:  element.itemDetails.gst,
                    // Sale Price Details
                    sale_price_per_box: element.pricePerBox,
                    sale_price_per_piece: element.pricePerPiece,
                    average_sale_price_per_piece: element.itemDetails.averageSalePricePerPiece,
                    sale_total_price: element.itemDetails.totalAmount,
                    sale_discount_price: 0,
                    // GST and Profit Earned
                    profit_earned: element.itemDetails.profitEarned,
                    gst_earned: element.itemDetails.gstEarned,
                });

                // calculate total gst and profit for the current line item - item
                item.itemDetails.gst_earned += element.itemDetails.gstEarned;
                item.itemDetails.profit_earned += element.itemDetails.profitEarned;
                // item.itemDetails.sale_discount += element.itemDetails.sale_discount_price;
            });

            return item;
        })

    } else {
        throw new Error('No items found for this sale!');
    }
    return formated;
}

module.exports = {
    saveSale
}