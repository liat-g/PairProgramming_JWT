// contains the sequelize data models and seeding code
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { STRING } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.byToken = async(token)=> {
  try {
    // verify is the user object
    const verify = await jwt.verify(token, 'superSecretKey');

    if(verify){
      const user = await User.findByPk(verify.id);
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username,
    }
  });
  const match = await bcrypt.compare(password, user.password);
  if(match){
    return user;
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

User.prototype.generateToken = async () => {
  try {
    const token = jwt.sign({id: this.id}, 'superSecretKey');
    return { token };
  } catch (error) {
    console.log(error);
  }
}

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  credentials.map(user => { user.password = bcrypt.hashSync(user.password, saltRounds = 10);
  })
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

// const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
// // Store hash in your password DB.


// bcrypt.hash(yourPassword, saltRounds, (err, hash) => {
//       try{
//       const saltRounds = 10;
//       const yourPassword = user.
//       } catch (err){
  
//   }});


module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
