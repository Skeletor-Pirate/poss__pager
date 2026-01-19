const mysql=require("mysql2");

const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'323112rm',
    database:'pos_db',
    socketPath: "/tmp/mysql.sock"
        
});
pool.getConnection((err,connection)=>{
    if(err){
        console.error('Error connecting to the database:',err);
    }else{
        console.log('Connected to the database');
        connection.release();
    }
});
module.exports=pool
