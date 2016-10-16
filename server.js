var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

//===========

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// configuration =================
mongoose.connect(process.env.MONGOLAB_URI, function(err){
	if (err) {
		console.log("\n******************************************\n");
		console.log(err);
		console.log("\n******************************************\n");
	} else {
		console.log("\n******************************************\n");
		console.log("MongoDB Connected!!!");
		console.log("\n******************************************\n");
	}
}); // connect to the database
// mongoose.connect(configDB.url); // use this for local DB setup

console.log("====================================================");
console.log(process.env);

require('./config/passport')(passport); // pass passport for configuration

// set up express application
app.use(morgan('dev')); // this will log every request to the console
app.use(cookieParser()); // reads cookies which are needed for authentication
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// these are required for passport
app.use(session({ secret: 'theresalwaysasolution'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================
require('./app/routes.js')(app, passport); // load the routes and then pass in the app and fully configured passport

// launch the server
app.listen(port);
console.log('Server running on port: ' + port);