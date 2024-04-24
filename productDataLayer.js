const { connectToDB, getConnection } = require('./sql');

async function getProducts(){
    const connection = getConnection(); 
    const [products] = await connection.execute("select * from products");
    console.log(products,"Data") 
    return products; 
}

module.exports = {getProducts}