'use strict';

const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const cors = require('cors');
const session = require('express-session');
const Users = require('./users.js');
const Forum = require('./forum.js');
const dayjs = require('dayjs');
const QRCode = require('qrcode');
const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy;


// init express
const app = new express();
const port = 3001;

const UsersDB = new Users();
const ForumDB = new Forum();


passport.use(new LocalStrategy(function verify(username, password, callback){
  UsersDB.getUser(username, password).then((user) => {
      if(!user)
          return callback(null, false, {message : 'Incorrect username and/or password.'});
      return callback(null, user);
  });
}));

passport.use(new TotpStrategy(
  function (user, done) {
    return done(null, base32.decode(user.secret), 30); //30 seconds of key validity
  }
));

app.use(cors({
  origin : 'http://localhost:5173',
  credentials : true
}))

app.use(express.json());
app.use(morgan('dev'));

app.use(session({
  secret: 'I vitelli dei romani sono belli',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    sameSite: 'lax',
  }
}));

app.use(passport.authenticate('session'));

passport.serializeUser((user, cb) => {
  cb(null, /*{id : user.id, email:user.email, name:user.name, secret : user.secret}*/user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

//STANDARD LOGIN
app.post('/login', passport.authenticate('local'), (req, res) => {
  try{
    return res.json(clientUserInfo(req));
  }catch(err){
    return res.status(500).json({error : err});
  }
});

//TOTP LOGIN

app.post('/login-totp', isLoggedIn, passport.authenticate('totp'), (req, res) => {
  try{
  req.session.method = 'totp';
  return res.json({otp : 'authorized'});
  }
  catch(err){
    return res.status(500).json({error : err});
  }
});

app.get('/2faCode', isLoggedIn, (req, res) => {
  QRCode.toDataURL(`otpauth://totp/MyApp?secret=${req.user.secret}&issuer=MyApp`, (err, url) => {
    if(err)
      return res.status(500).json({error:err});
    return res.status(200).json({url : url});
  })
})

//CURRENT SESSION
app.get('/session', isLoggedIn, (req, res) => {
  
  return res.json(clientUserInfo(req));

});
//LOGOUT
app.delete('/logout', isLoggedIn, (req, res) => {
  return req.logout(() => res.json({}));
})

//GET ALL POSTS
app.get('/post', async (req, res) => {
  const result = await ForumDB.getPosts();

  return res.json(result);
})

//GET POST BY ID

app.get('/post/:id', isLoggedIn, isValidId, async (req, res) => {
  try{
  const result = await ForumDB.getPostById(req.params.id);

  return res.json(result);
}catch(err){
  return res.status(500).json({error: err});
}
})

//POST NEW POST
app.post('/post', isLoggedIn, async (req, res, next) => {
  if(!req.body.title)
    return res.status(400).send("No title provided");
  if(!req.body.text || req.body.text==="")
    return res.status(400).send("Invalid text for post");
  if(req.body.maxcomments){
    const maxcomments = parseInt(req.body.maxcomments);
    if(!Number.isInteger(maxcomments))
      return res.status(400).send("maxcomments must be an integer value");
    if(maxcomments<0)
      return res.status(400).send("maxcomments must be a non-negative value");
  }

  next();
},
async (req, res) => {

  try{
  let author = "";
  if(req.user.name===undefined)
    author = req.user.email;
  else
    author = req.user.name;
  
  const timestamp = dayjs().toISOString()

  const ok = await ForumDB.addPost(req.body.title, author, req.user.id, req.body.text, req.body.maxcomments, timestamp);

  console.log(ok);

  if(ok===-1)
    return res.status(403).send("Title already present in the posts' database");
  if(ok)
    return res.status(200).json({id: ok});
}catch(err){
  return res.status(500).send("Something went wrong with the post submission: " + err);
}
})

app.put('/post/:id', isLoggedIn, isValidId, isPostAuthorOrAdmin, async (req, res) => {
  try{
    if(!req.body.text)
      return res.status(400).send("Field text is needed to update the post");
    const result = await ForumDB.editPost(req.params.id, req.body.text);
    if(!result)
      return res.status(400).send("text field mustn't be empty");
    else
      return res.json({message : "Text successfully modified"});
  }catch(err){
    return res.status(500).json({error : err});
  }
})

//DELETE POST
app.delete('/post/:id', isLoggedIn, isValidId, isPostAuthorOrAdmin, async (req, res) => {
  try{
        await ForumDB.deletePost(req.params.id);
        return res.status(200).json({message : "Post successfully deleted"});
  }catch(err){
    return res.status(500).send("Something went wrong with the post cancellation " + err);
  }
});

//GET COMMENTS OF A POST GIVEN THE POST ID
app.get('/comment/:id', isValidId, async (req, res) => {
  try{
  const result = await ForumDB.getComments(req.params.id);

  if(result.length>0){
    if(req.isAuthenticated())
      return res.json(result);
    else
      return res.json(result.filter(c => c.author===null));
  }
  else
    return res.status(204).json({message : "No comments appended to this post"});
  }catch(err){
    return res.status(500).json({error: err});
}

});

//APPEND A COMMENT TO A POST GIVEN THE POST ID
app.post('/comment/:id', isValidId, 
async (req, res) => {
  try{
  if(!req.body.text)
    return res.status(400).send("Field text is necessary");
  if(req.body.text==="")
    return res.status(400).send("Content mustn't be empty");

  let author = undefined;
  let authorId = undefined;
  if(req.user){
    authorId = req.user.id;
    author = req.user.name ? req.user.name : req.user.email;
  }


  const result = await ForumDB.addComment(req.body.text, dayjs().toISOString(), author, authorId, req.params.id);
  if(!result)
    return res.status(403).json({ message : "Comment limit reached"});
  else
    return res.status(200).json(result);
}
catch(err){
  return res.status(500).json({error : err});
}
})
//MARK INTERESTING COMMENT

app.get('/comment/:id/allMark', isLoggedIn, isValidComment, async (req, res) => {
  try{
    const result = await ForumDB.getInterestingMarks(req.params.id);

    return res.json(result);
  }catch(err)
  {
    return res.status(500).json({error:err});
  }
})


app.put('/comment/:id/unmark', isLoggedIn, isValidComment, async (req, res) => {
  try{
    await ForumDB.unmarkInterestingComment(req.user.id, req.params.id);
    return res.json({message: "Comment successfully unmarked"});
  }catch(err){
    return res.status(500).json({error: err});
  }
  }
)
app.put('/comment/:id/mark', isLoggedIn, isValidComment, async (req, res) => {
  try{
    await ForumDB.markInterestingComment(req.user.id, req.params.id, dayjs());
    return res.json({message: "Comment successfully unmarked"});
  }catch(err){
    return res.status(500).json({error: err});
  }
});
//EDIT COMMENT TEXT
app.put('/comment/:id', isLoggedIn, isCommentAuthorOrAdmin, isValidComment, async (req, res) => {
  try{
    const result = await ForumDB.editComment(req.params.id, req.body.text);

    console.log(result);
    if(result)
      return res.status(200).json(result);
    else
     return res.status(400).send("Empty new text");
  }catch(err){
    return res.status(500).send("Something went wrong with the comment editing: " + err);
  }
})
//DELETE COMMENT
app.delete('/comment/:id', isLoggedIn, isCommentAuthorOrAdmin, isValidComment, async (req, res) => {
  try{
     await ForumDB.deleteComment(req.params.id);
    
     return res.status(200).send("Ok");
  }catch(err){
    return res.status(500).send("Something went wrong with the comment deleting: " + err);
  }
})

// activate the server
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${port}`);
}); 

//MIDDLEWARES

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
      return next();
  return res.status(401).json({message : "not authenticated"});
}

function isAdmin(req, res, next){
  if(req.session.method === 'totp')
    return next();
  return res.status(401).json({error: 'missing TOTP authentication'});
}

async function isPostAuthorOrAdmin(req, res, next){
  const author = await ForumDB.getPostAuthor(req.params.id);

  if(author===req.user.id || req.session.method === 'totp')
    next();
  else
    return res.status(401).json({error: "You are not the author of the selected post nor an administrator"});
}

async function isCommentAuthorOrAdmin(req, res, next){
  const author = await ForumDB.getCommentAuthor(req.params.id);

  if(author===req.user.id || req.session.method === 'totp')
    next();
  else
    return res.status(401).json({error: "You are not the author of the selected post nor an administrator"});

}

async function isValidId(req, res, next){
  const id = parseInt(req.params.id, 10);
  if(!checkIdValidity(id))
   return res.status(400).json({error :"Id must be an integer number greater than 0"});

  
  const exists = await ForumDB.getPostById(id);
  if(exists){
    req.params.id = id; 
    next();
  }
  else
    return res.status(404).json({message : "Id value doesn't match any element in the database"});
}

async function isValidComment(req, res, next){
  const id = parseInt(req.params.id, 10);
  if(!checkIdValidity(id))
   
    return res.status(400).json({error: "Id must be an integer number greater than 0"});

  const exists = await ForumDB.getCommentById(id);

  if(exists){
    req.params.id = id; 
    next();
  }
  else
    return res.status(404).json({error:"Id value doesn't match any element in the database"});

}

function checkIdValidity(id){
  return !isNaN(id) && Number.isInteger(id) && id>0;
}

function clientUserInfo(req){
  const user = req.user;
  return {id : user.id, username : user.email, name : user.name, isAdmin : user.secret ? true:false};
}