import passport from 'passport';
import * as passportGoogle from 'passport-google-oauth20';
import * as dotenv from 'dotenv';

dotenv.config();

const GoogleStrategy = passportGoogle.Strategy;
const googleId = process.env.GOOGLE_CLIENT_ID as string;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET as string;

passport.use(new GoogleStrategy({
    clientID: googleId,
    clientSecret: googleSecret,
    callbackURL: 'http://localhost:5001/api/user/login/google/callback'
}, () => {
    console.log('test');
}));