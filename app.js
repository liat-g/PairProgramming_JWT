const express = require('express');
const app = express();
app.use(express.json());
const { models: { User }} = require('./db');
const path = require('path');
const jwt = require('jsonwebtoken');


app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
    // console.log(user, req.body);
    const user = await User.authenticate(req.body);
    if (user === undefined){
      res.sendStatus(404)
    }
    const token = await user.generateToken();

    res.send(token);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', async(req, res, next)=> {
  try {
    const user = await User.byToken(req.headers.authorization);
    //const verifyToken = await user.verifyToken();
    const verify = jwt.verify(user, 'superSecretKey');

    res.send(user);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});



module.exports = app;
