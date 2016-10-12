module.exports = function(app, passport) {

  // Home Page with login links
  app.get('/', function(req, res){
    res.render('index.ejs'); // loads the index.ejs file
  });

  // ==================================================================
  // Login Page 
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
  // this section will need to be protected so you have to login to view
  // using route middleware to verify a user is logged in usgin the isLoggedIn function
  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile.ejs', {
      user : req.user // this gets the user out of session and passed to template
    });
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
  // Logout
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
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
