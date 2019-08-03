const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy
//const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/auth/google/callback',
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await User.findOne({ where: {snsId: profile.id, provider: 'google'} });
            if(exUser) {
                return done(null, exUser);
            } else {
                const newUser = await User.create({
                    email: profile.emails[0].value,
                    nickname: profile.displayName,
                    snsId: profile.id,
                    provider: 'google',
                });
                return done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};