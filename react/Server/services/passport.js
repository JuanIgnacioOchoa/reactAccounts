const passport = require('passport');
// npm install --save passport passport-google-oauth20
const GoogleStrategy = require('passport-google-oauth20').Strategy; // the passport strategy for google oauth
//const GoogleStrategy = require('passport-google-drive').Strategy; // the passport strategy for google oauth

const keys = require('../config/keys');
const User = require('./../models/User')
//create an arrow function to create the cookies to give to the brwoser
passport.serializeUser((user, done) => { // the user val is sent from the done function from the strategy
    console.log('serialize')
    console.log('user', user)
    done(null, user)
})

passport.deserializeUser((user, done) => {
    console.log('deserialize')
    console.log('user', user)
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
},
(accessToken, refreshToken, profile, done) => {
    console.log('AccessToken', accessToken)
    console.log('refreshToken', refreshToken)
    var user = new User(profile.displayName, profile.id, accessToken)
    console.log('user', user)
    done(null, user)
})
);