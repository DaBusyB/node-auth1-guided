const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session') //higher order method is created that will return some middleware. 
                                            //we can pass in a config object that will have data so that the the middleware we get back does things the way we want
const KnexSessionStore = require('connect-session-knex')(session) //returns a method that revceives as a parameter an express session obj


const usersRouter = require("../users/users-router.js");
const authRouter = require('../auth/auth-router.js')

const server = express();

const sessionConfig = { 
  //this will send back to the browser a cookie containing the session id
  //the browser will send back to us the same session id as a token 
  //we use the token to look up the session obj that we will keep in memory
  //the session obj helps us to determine if it's expired, what auth the user has and lots of other info

  name: 'monkey', //name the cookie
  secret: 'keep it secret', //used to encrypt the session id, so that what's stored on the browser is the session id but encrypted
  cookie: { //control elements of the cookie
    maxAge: 1000 * 60 * 60, //how long the cookie lasts until user has to sign in again
    secure: false,//tells if cookie can be sent accross http reqs in plain text without being encrypted with https. this would normally be true. i would need a certificate and configure express to work with certificates and work with https
    httpOnly: true, //can the cookie be accessed by JS on the browser, or only be accessed by sending it to a server over an http request. we typically want to hide the cookie fron JS
  },

  resave: false, //has to do with saving dbs
  saveUnintialized: false, //should the browser let the cookie be saved without the users consent. see gdpr rules

  //use this to save sessions in db so they will persist
  store: new KnexSessionStore({ //installed connect-sessions-knex and here we give the sessionConfig info about what db we want to use so that our logins persist on a db even if the server restarts
    knex: require('../database/connection.js'),//it needs a configured instance of knex this points to the knex config file which points to our db
    tablename: 'sessions',//tells what table to store session data in. here we are creating a new table, we can call it what we want
    sidfieldname: 'sid',//tells what column name will contain the session id in the table 
    createtable: true,//should we create the table if it doesnt exist?
    clearInterval: 1000 * 60 * 60//periodically go through db and delete expired sessions records. takes number in milli seconds
  }),
  //the constructor for this will receive an obj that contains properties of configuration

}

//every req that comes in goes through these global middleware
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig))
// either create a new session obj in memory and then add the session obj to the req obj 
//or use the session id from an incoming cookie to look up the session obj that's already in memory and use that and add it to the req obj
//either way, the req obj will always have a session obj

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
