const express=require('express');
const bodyParser=require('body-parser');
const productController=require('../controllers/productController');
const authorizeRoles=require('../middleware/roleMiddleware');
const router=express.Router();

// route to add a new product
router.post('/',authorizeRoles('admin'),productController.addProduct);
// route to get all products
router.get('/',authorizeRoles('admin','manager'),productController.getAllProducts);
module.exports=router;
