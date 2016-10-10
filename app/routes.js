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
  // Profile Page
  // 

};
