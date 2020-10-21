import { google } from 'googleapis';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { createNewToken } from '../controllers/user-controller';
import * as dotenv from 'dotenv';

dotenv.config();

// Google API setup
const googleId = process.env.GOOGLE_CLIENT_ID as string;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const redirectURL =
  'http://195.230.156.40:5001/api/user/login/google/callback';

async function getOAuthClient() {
  return await new google.auth.OAuth2(
    googleId,
    googleSecret,
    redirectURL,
  );
}
async function getGoogleAuthURL() {
  const OAuth2 = await getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/contacts.readonly profile email openid',
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
    ctx.body = `<h1>Authentication using google oAuth</h1><a href=${url}>Login</a>`;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Google URL failed',
      err: err,
    };
  }
};

// Google auth callback route
export const googleAuthCallback = async (ctx: Context) => {
  try {
    const OAuth2 = await getOAuthClient();
    const code = ctx.request.query.code as string;
    const tokenRes = await OAuth2.getToken(code);

    if (!tokenRes) {
      console.log('Google get token error');
      ctx.status = 400;
      ctx.body = {
        message: 'Google get token failed',
      };
      return;
    }
    await OAuth2.setCredentials(tokenRes.tokens);

    const service = await google
      .people({ version: 'v1' })
      .people.get({
        auth: OAuth2,
        resourceName: 'people/me',
        personFields: 'names,emailAddresses',
      });
    const id = service.data.names
      ? service.data.names[0].metadata
        ? service.data.names[0].metadata.source
          ? service.data.names[0].metadata.source.id
          : null
        : null
      : null;
    const email = service.data.emailAddresses
      ? service.data.emailAddresses[0].value
      : null;
    const name = service.data.names
      ? service.data.names[0].displayName
      : null;
    let token = '';
    if (id && email && name) {
      token = createNewToken(true, id);
      const userExist = await User.findByPk(id);
      console.log('userExist', userExist);
      if (userExist) {
        userExist.name =
          userExist.name !== name ? name : userExist.name;
        userExist.email =
          userExist.email !== email ? email : userExist.email;
        await userExist.save();
      } else {
        await User.create({
          id: id,
          email: email,
          isAdmin: false,
          name: name,
          rememberPassword: true,
        });
      }
    } else {
      console.log('Failed get Google profile data');
      ctx.status = 400;
      ctx.body = {
        message: 'Failed get Google profile data',
      };
    }

    ctx.status = 200;
    ctx.body = {
      message: 'Logged in with Google',
      token: token,
    };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Google sign in failed',
      err: err,
    };
  }
};
