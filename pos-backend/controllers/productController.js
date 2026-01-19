const productModel =require("../models/productModel");
// add a new product
async function addProduct(req,res){
    const {name,price ,quantity}=req.body;
    // basic input validation 
    if(!name || price==null || quantity==null){
        return res.status(400).json({message:"invalid input"})
    }
    if (price<0 || quantity<0){
        return res.status(400).json({message:"price and quantity must be non-negative"})
    }

    try{
        const result=await productModel.addProduct(name ,price ,quantity)
        res.status(201).json ({message:"product added successfully",productId:result.insertId,})
    }
    catch(err){
        return res.status(500).json({message:"server error"})
    }
}
// get all products
async function getAllProducts(req,res){
    try{
        const products=await productModel.getAllProducts();
        res.status(200).json({products:getAllProducts})

    }
    catch(err){
        return res.status(500).json({message:"server error"})
    }
}
module.exports={addProduct,getAllProducts}