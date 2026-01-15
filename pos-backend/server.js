const express=require('express');
const app=express();
app.get('/',(req,res)=>{
    res.send('Point of Sale Backend is running');
})
app.listen(3000,()=>{
    console.log('POS Backend is listening on port 3000');
})