const express=require('express');
const app=express();
const productRoutes=require('./routes/products');
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('Point of Sale Backend is running');
})
app.use("/products",authMiddleware,productRoutes);
app.use("/auth", authRoutes);
const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})