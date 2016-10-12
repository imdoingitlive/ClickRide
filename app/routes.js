module.exports = function(app, passport) {

  // Home Page with login links
  app.get('/', function(req, res){
    res.render('index.ejs'); // loads the index.ejs file
  });

  // ==================================================================
  // Login Page
  // ========== 
  // show the login form
  app.get('/login', function(req, res){
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to secure profile 
    failureRedirect : '/login', // redirect to login
    failureFlash : true // allow flash messages
  }));
  // ==================================================================
  // ==================================================================
  // Signup Page
  // ===========
  // show signup form
  app.get('/signup', function(req, res){
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') }); 
  })

  // process the form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  // ==================================================================
  // ==================================================================
  // Profile Page
  // ============
  // this section will need to be protected so you have to login to view
  // using route middleware to verify a user is logged in usgin the isLoggedIn function
  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile.ejs', {
      user : req.user // this gets the user out of session and passed to template
    });
  });
  // ==================================================================
  // ==================================================================
  // Logout
  // ======
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  // ==================================================================
  // ==================================================================
  // Facebook routes
  // ===============
  // route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // handle the callback AFTER facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
  // ==================================================================
  // ==================================================================
  // Twitter routes
  // ==============
  // route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
  // ==================================================================
  // ==================================================================
  // Google routes
  // =============
  // route for google auth and login
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback', 
    passport.authenticate('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
  // ==================================================================
  // ==================================================================
  // Authorize (already logged in / connecting other social account)
  // =========
  
  // ==================================================================
  // Local
  // =====
  app.get('/connect/local', function(req, res){
    res.render('connect-local.ejs', { message : req.flash('loginMessage') });
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/connect/local', // redirect to signup page if there is an error
    failureFlash : true
  }));
  // ==================================================================
  // Facebook
  // ========
  app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback', 
    passport.authorize('facebook', {
      successRedirect : 'profile',
      failureRedirect : '/'
    }));
  // ==================================================================
  // Twitter
  // =======
  app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

  // handle the callback after twitter has authorized the user
  app.get('/connect/twitter/callback', 
    passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
  // ==================================================================
  // Google
  // ======
  app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

  // handle the callback after google has authorized the user
  app.get('/connect/google/callback', 
    passport.authorize('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
};

// route middleware to make sure a user is actually logged in
function isLoggedIn(req, res, next){
  // if a user is authenticated in the session then carry on
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/');
  }
}
