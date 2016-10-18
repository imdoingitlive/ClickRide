var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var UberStrategy = require('passport-uber').Strategy;

var User = require('../app/models/user');

// loade the auth variables
// if locally storing IDs and keys use below
// var configAuth = require('./auth');
var configAuth = require('./auth_template');

// expose this function to the app
module.exports = function(passport){
  // passport session setup
  // ===============================
  // required for persistent login sessions 
  // passport requires ability to serialize and unserialize users out of session

  // this is for serializing the user for the session
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  // this will deserialize the user
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  // ===============================
  // local signup
  // ===============================
  // using names strategies since there is one for login and one for signup
  // if no name then called 'local' by default

  passport.use('local-signup', new LocalStrategy({
    // be default local strategy uses username and pass, but this will override to use email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows to pass the entire request to the callback
  },
  function(req, email, password, done){
    // asynchronous
    // User.findOne will not fire unless data is sent back
    process.nextTick(function(){
      // find a user whose email is the same as the forms email
      // we check to see if the user trying to login already exists
      User.findOne({ 'local.email' : email}, function(err, user){
        if (err){
          return done(err);
        }

        // check to see if there is a user with that email in db
        if (user){
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
        } else {
          // if there is no user with that email then make the user
          var newUser = new User();

          // set user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // save the user
          newUser.save(function(err){
            if (err){
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // ==================================
  // local login
  // ==================================
  // again using named strategies since there is one for signup and login
  // would be called local if there was no name

  passport.use('local-login', new LocalStrategy({

    // by default local strategy uses username but this will be replaced with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows to pass the entire req to the callback
  },
  function(req, email, password, done){ // callback with email and pass from the form

    // find a user whose email is the same as the form
    // we are checking to see if the user trying to login exists
    User.findOne({ 'local.email' : email }, function(err, user){
      if (err){
        return done(err);
      }

      // if no user is found, return this message
      if (!user){
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      // if the user is found but the pass is wrong
      if (!user.validPassword(password)){
        return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
      }

      // no err return successful user
      return done(null, user);  
    });  
  }));

  // ===============================
  // Facebook
  // ===============================
  passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID : process.env.configAuth_facebookAuth_clientID,
    clientSecret : process.env.configAuth_facebookAuth_clientSecret,
    callbackURL : configAuth.facebookAuth.callbackURL,
    profileFields : ["emails", "displayName"],
    passReqToCallback : true // allows to pass in the req from the route (check to see if the user is logged in or not)
  },

  // facebook will send back the token and profile
  function(req, token, refreshToken, profile, done){

    // asynchronous
    process.nextTick(function(){
      // find the user in the database based on their facebook id
      
      // check if the user is already logged in
      if (!req.user){

        User.findOne({ 'facebook.id' : profile.id }, function(err, user){
          // if err stop everything and return the err
          // ie err connecting to the db
          if (err) {
            return done(err);
          }

          // if the user is found log them in
          if (user) {
            
            // this block will relink after unlinking
            // if there is a user ID already but no token (user was linked at one point but then removed)
            // just add token and profile information
            if (!user.facebook.token){
              user.facebook.token = token;
              user.facebook.name = profile.displayName;
              user.facebook.email = profile.emails[0].value;

              user.save(function(err){
                if (err){
                  throw err;
                }
                return done(null, user);
              });
            }
            // ============== end of relink block ==================
            // =====================================================
            return done(null, user); // user found, return that user
          } else {
            // if there isnt a user found with the facebook id then create them
            var newUser = new User();

            // set all of the facebook information in the user model
            newUser.facebook.id = profile.id; // set the users facebook id
            newUser.facebook.token = token; // save the token that facebook provides to the user
            newUser.facebook.name = profile.displayName; // look at the passport user file
            newUser.facebook.email = profile.emails[0].value; // facebook might return multiple emails so this grabs the first one

            // save the user to the database
            newUser.save(function(err){
              if (err){
                throw err;
              }

              // if successful return the new user
              return done(null, newUser);
            });
          }
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session

        // update the current users facebook credentials
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.displayName;
        user.facebook.email = profile.emails[0].value;

        // save the user
        user.save(function(err){
          if (err) {
            throw err;
          }

          return done(null, user);
        });
      }
    });
  }));

  // ============================
  // Twitter
  // ============================
  passport.use(new TwitterStrategy({

    consumerKey : process.env.configAuth_twitterAuth_consumerKey,
    consumerSecret : process.env.configAuth_twitterAuth_consumerSecret,
    callbackURL : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true
  },

  function(req, token, tokenSecret, profile, done){
    // make the code asynchronous
    // User.findOne will not run until all the data is back from Twitter
    process.nextTick(function(){

      if (!req.user){

        User.findOne({ 'twitter.id' : profile.id }, function(err, user){
          // if any err stop and return err
          // ie err connecting to db
          if (err) {
            return done(err);
          }

          // if user is found then log them in
          if (user) {

            // this block will relink after unlinking
            // if there is a user ID already but no token (user was linked at one point but then removed)
            // just add token and profile information
            if (!user.twitter.token){
              user.twitter.token = token;
              user.twitter.userName = profile.username;
              user.twitter.displayName = profile.displayName;

              user.save(function(err){
                if (err){
                  throw err;
                }
                return done(null, user);
              });
            }
            // ============== end of relink block ==================
            // =====================================================

            return done(null, user); // user is found, return that user
          } else {
            // if there is no user then create one
            var newUser = new User();

            // set all of the user data that we need
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            // save the user in the db
            newUser.save(function(err){
              if (err) {
                throw err;
              }

              return done(null, newUser);
            });
          }
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session

        // update the current users twitter credentials
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.userName = profile.username;
        user.twitter.displayName = profile.displayName;

        // save the user
        user.save(function(err){
          if (err) {
            throw err;
          }

          return done(null, user);
        }); 
      }
    });
  }));

  // =========================
  // Google
  // =========================
  passport.use(new GoogleStrategy({

    clientID : process.env.configAuth_googleAuth_clientID,
    clientSecret : process.env.configAuth_googleAuth_clientSecret,
    callbackURL : configAuth.googleAuth.callbackURL,
    passReqToCallback : true

  },
  function(req, token, refreshToken, profile, done){
    // code is asynchronous
    // User.findOne will not run until all info is back from google
    process.nextTick(function(){

      if (!req.user){
        // look for the user in the db
        User.findOne({ 'google.id' : profile.id }, function(err, user){
          if (err) {
            return done(err);
          }

          if (user) {
            // this block will relink after unlinking
            // if there is a user ID already but no token (user was linked at one point but then removed)
            // just add token and profile information
            if (!user.google.token){
              user.google.token = token;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value;

              user.save(function(err){
                if (err){
                  throw err;
                }
                return done(null, user);
              });
            }
            // ============== end of relink block ==================
            // =====================================================

            // if a user is found return the user
            return done(null, user);
          } else {
            // if no user in db then create a new one
            var newUser = new User();

            // set all information to google info
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value; // use the first email

            // save the user
            newUser.save(function(err){
              if (err){
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session

        // update the current users google credentials
        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = profile.emails[0].value;

        // save the user
        user.save(function(err){
          if (err) {
            throw err;
          }

          return done(null, user);
        }); 
      }
    });
  }));

  // ===========================
  // Uber
  // ===========================
  passport.use(new UberStrategy({

    clientID : process.env.configAuth_uberAuth_clientID,
    clientSecret : process.env.configAuth_uberAuth_clientSecret,
    callbackURL : configAuth.uberAuth.callbackURL,
    passReqToCallback : true

  },
  function(req, token, refreshToken, profile, done){
    // code is asynchronous
    // User.findOne will not run until all info is back from uber
    process.nextTick(function(){

      if (!req.user){
        // look for the user in the db
        User.findOne({ 'uber.id' : profile.uuid }, function(err, user){
          if (err) {
            return done(err);
          }

          // need to set this up so it removes duplicates in the db
          if (user) {
            // if a user is found return the user
          //   return done(null, user);
          // } else {
            // if no user in db then create a new one
            var newUser = new User();

            // set all information to uber info
            newUser.uber.id = profile.uuid;
            newUser.uber.token = token;
            newUser.uber.name = profile.first_name + ' ' + profile.last_name;
            newUser.uber.email = profile.email; // use the first email

            // save the user
            newUser.save(function(err){
              if (err){
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session

        // update the current users uber credentials
        user.uber.id = profile.uuid;
        user.uber.token = token;
        user.uber.name = profile.first_name + ' ' + profile.last_name;
        user.uber.email = profile.email;

        // save the user
        user.save(function(err){
          if (err) {
            throw err;
          }

          return done(null, user);
        }); 
      }
    });
  }));
};