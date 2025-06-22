"use strict";

const sqlite = require('sqlite3');
const crypto = require('crypto');


function Users(){
    const db= new sqlite.Database('forum.db', (err) => {
        if(err) throw err;
    })

    this.checkDuplicate =  (email) =>{
        return new Promise((resolve, reject)=>{
            const query = 'SELECT * FROM users WHERE email=?';
            db.get(query, [email], (err, row) => {
                if(err)
                    reject(err);
                resolve(row);
            });
        });
    }

    this.addUser = async (email, password, name, secret) => {
        
        const duplicate = await this.checkDuplicate(email);
        if(duplicate)
            return(false);
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16);
            crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                if(err)
                    reject(err);
                else{
                    const query = 'INSERT INTO users (email, name, hash, salt, secret) VALUES(?,?,?,?,?)';
                    const params = [email, name, hashedPassword, salt, secret];
                    db.run(query, params, (err) => {
                        if(err)
                            reject(err);
                        else
                            resolve(true);
                    })
                }
                
            })
            
        });
    }


    this.getUser = (email, password) => {
        
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email=?';
            db.get(query, [email], (err, row) => {
                if(err)
                    reject(err);
                else if(row===undefined)
                    resolve(false);
                else{
                    const salt = row.salt;

                    crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                        if(err)
                            reject(err);
                        if(!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
                            resolve(false);
                        else
                            resolve(row);
                        })
                }
            });
        });
    }

    this.adminSecret = (userID) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM users WHERE id=?";
            db.get(query, [userID], (err, row) => {
                if(err)
                    reject(err);
                resolve(row);
            });
        });
    }

    
}

module.exports = Users;