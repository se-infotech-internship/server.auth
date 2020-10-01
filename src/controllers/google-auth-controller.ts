import { google } from 'googleapis';
import { Context } from 'koa';
import * as dotenv from 'dotenv';

dotenv.config();

// Google API setup
const googleId = process.env.GOOGLE_CLIENT_ID as string;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const redirectURL = 'http://localhost:5001/api/user/login/google/callback'

async function getOAuthClient() {
    return await new google.auth.OAuth2(googleId,  googleSecret, redirectURL);
}
async function getGoogleAuthURL() {
  const OAuth2 = await getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/plus.me'
  ];

  return await OAuth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

// Google auth page
export const googleAuth = async (ctx: Context) => {
  try {
    const url = await getGoogleAuthURL();
    // console.log(url);
    ctx.body = `<h1>Authentication using google oAuth</h1><a href=${url}>Login</a>`
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Google URL failed',
      err: err,
    };
  }  
}

// Google auth callback route
export const googleAuthCallback = async (ctx: Context) => {
  try {
    const OAuth2 = await getOAuthClient();
    const code = ctx.request.query.code;
  
    await OAuth2.getToken(code, async (err, tokens) =>{ 
      if(!err && tokens) {
        OAuth2.setCredentials(tokens);
        await google.plus('v1').people.get({
          userId: 'me',
          auth: OAuth2
        },(err, res)=>{
          if (err || !res) {
            console.log(err);
            ctx.status = 400;
            ctx.body = {
              message: 'Google sign in failed',
              err: err,
            };
            return;
          }
          console.log(res.data);
        })
        ctx.status = 200;
        ctx.body = {
          message: 'Logged in with Google',
        };
      }
      else {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
          message: 'Google get token failed',
          err: err,
        };
      }
    })
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Google sign in failed',
      err: err,
    };
  }
}