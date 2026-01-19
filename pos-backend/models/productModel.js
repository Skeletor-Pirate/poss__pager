const db=require('../db');
// add a new product
function addProduct(name,price,stock){
    return new Promise((resolve,reject)=>{
        const query='INSERT INTO products (name,price,stock) VALUES (?,?,?)';
        db.query(query,[name,price,stock],(err,result)=>{
            if(err){
                return reject(err);
            }
            else {
                resolve(result)
            }
        })
    })
}
// get all products
function getAllProducts(){
    return new Promise((resolve, reject)=>{
        const query='SELECT *FROM products';
        db.query(query,(err,result)=>{
            if(err){
                return reject(err);
            }
            else {
                 resolve(result)
            }
        })
    })
}
// update product stock
function updateProductStock(id,stock){
    return new Promise((resolve,reject)=>{
        const query ="UPDATE products set stock=? WHERE id=?"
        db.query(query,[stock,id],(err,result)=>{
            if(err){
                return reject(err);
            }
            else {
                 resolve(result)
            }
        })
    })
}
module.exports={addProduct,getAllProducts,updateProductStock}