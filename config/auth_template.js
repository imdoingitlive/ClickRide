module.exports = {

  'facebookAuth' : {
    'clientID' : 'client-id-here', // App ID
    'clientSecret' : 'client-secret', // App secret
    'callbackURL' : 'https://clickride.herokuapp.com/auth/facebook/callback'
  },

  'twitterAuth' : {
    'consumerKey' : 'consumer-key-here',
    'consumerSecret' : 'consumer-secret',
    'callbackURL' : 'https://clickride.herokuapp.com/auth/twitter/callback'
  },

  'googleAuth' : {
    'clientID' : 'clientID-here',
    'clientSecret' : 'client-secret',
    'callbackURL' : 'https://clickride.herokuapp.com/auth/google/callback'
  },

  'uberAuth' : {
    'clientID' : '',
    'clientSecret' : '',
    'callbackURL' : 'https://clickride.herokuapp.com/auth/uber/callback'
  }
    
};