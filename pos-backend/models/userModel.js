const db=require('../db');
// add a new user
function createUser(name,email,password,role){
    return new Promise((resolve,reject)=>{
        const query='INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)';
        db.query(query,[name,email,password,role],(err,result)=>{
            if(err){
                return reject(err);
            }
            else {
                resolve(result)
            }
        })
    })
}
// get user by username
function findUserByEmail(email){
    return new Promise((resolve, reject)=>{
        const query='SELECT *FROM users WHERE email=?';
        db.query(query,[email],(err,result)=>{
            if(err){
                return reject(err);
            }
            else {
                 resolve(result[0])
            }
        })
    })
}
module.exports={createUser,findUserByEmail}