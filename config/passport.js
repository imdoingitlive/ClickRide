var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../app/models/user');

// loade the auth variables
var configAuth = require('./auth');

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
    clientID : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL : configAuth.facebookAuth.callbackURL,
    profileFields : ["emails", "displayName"]
  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, done){

    // asynchronous
    process.nextTick(function(){
      // find the user in the database based on their facebook id
      User.findOne({ 'facebook.id' : profile.id }, function(err, user){
        // if err stop everything and return the err
        // ie err connecting to the db
        if (err) {
          return done(err);
        }

        // if the user is found log them in
        if (user) {
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
    });
  }));
};