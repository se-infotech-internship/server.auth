import { google } from 'googleapis';
import { Context } from 'koa';
import * as dotenv from 'dotenv';
// import fetch from 'node-fetch';

dotenv.config();

// Google API setup
const googleId = process.env.GOOGLE_CLIENT_ID as string;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const OAuth2 = new google.auth.OAuth2(
  googleId, 
  googleSecret,
  'http://localhost:5001/api/user/login/google/callback'
  );

  function getGoogleAuthURL() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return OAuth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
}

export const googleAuth = async (ctx: Context) => {
    const url = getGoogleAuthURL();
    ctx.body = `<h1>Authentication using google oAuth</h1><a href=${url}>Login</a>`
}

export const googleAuthCallback = async (ctx: Context) => {
  console.log('google callback');
}