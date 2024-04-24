const dataLayer = require('./productDataLayer'); 

async function getProducts(){
    return await dataLayer.getProducts(); 
}

module.exports = {getProducts}; 