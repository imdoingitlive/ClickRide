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
  // app.post('/login', do all our passport stuff here);
  // ==================================================================

  // ==================================================================
  // Signup Page
  // show signup form
  app.get('/signup', function(req, res){
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') }); 
  })

  // process the form
  // app.post('/signup', do all our passport stuff here);
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
  // Logout
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
};
