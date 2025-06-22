"use strict";

const dayjs = require('dayjs');
const sqlite = require('sqlite3');

function Forum(){
    const db= new sqlite.Database('forum.db', (err) => {
            if(err) throw err;
        });
    
    this.getPosts = () => {
        return new Promise((resolve, reject)=>{
            const query = 'SELECT * FROM posts';
            db.all(query, [], (err, row) => {
                if(err)
                    reject(err);
                resolve(row.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())); 
                //The array is resolved directly sorted from the most recent to the least recent
            });
        });
    }

    this.getPostById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM posts WHERE id=?";
            db.get(query, [id], (err, row) => {
                if(err)
                    reject(err);
                resolve(row);
            });
        });
    }
    
    this.getPost = (title) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM posts WHERE title=?";
            db.get(query, [title], (err, row) => {
                if(err)
                    reject(err);
                resolve(row);
            });
        });
    }

    this.addPost = async (title, author, authorid, text, maxcomments, timestamp) => {
        const dupliCheck = await this.getPost(title);

        if(dupliCheck)
            return -1;

        return new Promise((resolve, reject) => {
            const query = "INSERT INTO posts (title, author, authorid, text, maxcomments, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
            const values = [title, author, authorid, text, maxcomments, timestamp];

            db.run(query, values, function (err) {
                if(err)
                    reject(err);
                else
                    resolve(this.lastID);
            })
        });
    }

    this.getPostAuthor = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT authorid FROM posts WHERE id=?";
            db.get(query, [id], (err, row) => {
                if(err)
                    reject(err);
                if(row)
                    resolve(row.authorid);
                else
                    resolve(false);
            });
        });
    }

    this.getCurrentCommentsNumber = async (id) => {
        const totalComments = await this.getComments(id);

        return totalComments.length;
    }

    this.editPost = (id, newText) => {
        if(newText==="")
            return(false);
        else
            return new Promise((resolve, reject) => {
                const query = "UPDATE posts SET text=? WHERE id=?";

                db.run(query, [newText, id], (err) => {
                    if(err)
                        reject(err)
                    resolve(true);
                })
            })
    }


    this.deletePost = (id) => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM posts WHERE id = ?";
            db.run(query, [id], (err)=>{
                if(err)
                    reject(err);
                else{
                    const subQuery= "DELETE FROM comments WHERE post = ?";
                    db.run(subQuery, [id], (err) => {
                        if(err)
                            reject(err);
                        resolve(true);
                    });
                }
            });
        })
    }


    this.addComment = async (text, timestamp, author, authorId, post) => {
        const p = await this.getPostById(post);
        const c = await this.getCurrentCommentsNumber(post);
        
        if(p.maxcomments && p.maxcomments <= c)
            return (false);
        
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO comments (text, timestamp, author, author_id, post) VALUES (?,?,?,?, ?)";
            const values = [text, timestamp, author, authorId, post];
            db.run(query, values, async function(err){
                if(err)
                    reject(err);
                else{
                    db.run("UPDATE posts SET currentcomments=currentcomments+1 WHERE id=?", [post], (err) => {
                        if(err)
                            reject(err);
                        else{
                            const query = "SELECT * FROM comments WHERE id=?";
                            db.get(query, [this.lastID], (err, row) =>{
                                if(err)
                                    reject(err)
                                else
                                    resolve(row);
                            })
                            
                        }
                            
                    })
                
                }
            });
        });
    }

    this.getComments = (post) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM comments WHERE post=?";
            db.all(query, [post], (err, rows) => {
                if(err)
                    reject(err);
                resolve(rows.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()));
            });
        });
    }

    this.getCommentById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM comments WHERE id=?";

            db.get(query, [id], (err, row) => {
                if(err)
                    reject(err);
                else
                    resolve(row);
            })
        });
    }

    this.getCommentAuthor = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT author_id FROM comments WHERE id=?";

            db.get(query, [id], (err, row) => {
                if(err)
                    reject(err);
                else
                    resolve(row.author_id);
            })
        })
    }

    this.getInterestingMarks = (commentId) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM interesting WHERE comment_id=?"
            db.all(query, [commentId], (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            })
        })
    }

    this.unmarkInterestingComment = (userId, commentId) => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM interesting WHERE user_id=? AND comment_id=?";
            const values = [userId, commentId];

            db.run(query, values, (err) => {
                if(err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    } 
    this.markInterestingComment = (userId, commentId, timestamp) => {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO interesting (user_id, comment_id, timestamp) VALUES (?, ?, ?)";
            const values = [userId, commentId, timestamp];

            db.run(query, values, (err) => {
                if(err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }

    this.editComment = (id, newText) => {
        if(newText==="")
            return(false);
        else
            return new Promise((resolve, reject) => {
                const query = "UPDATE comments SET text=? WHERE id=?";

                db.run(query, [newText, id], async (err) => {
                    if(err)
                        reject(err)
                    else{
                        const result = await this.getCommentById(id);
                        resolve(result);
                    }
                })
            })
    }

    this.deleteComment = async (id) => {
        const comment = await this.getCommentById(id);
        const post = await this.getPostById(comment.post);
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM comments WHERE id = ?";
            db.run(query, [id], (err)=>{
                if(err)
                    reject(err);
                else
                {

                    db.run("UPDATE posts SET currentcomments=currentcomments-1 WHERE id=?", [post.id], (err) => {
                        if(err)
                            reject(err);
                        else
                            resolve(true);
                    })
                }
            });
        })
    }
}

module.exports = Forum;