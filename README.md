## INFOTECH - Smart Radar Auth Service API & Gateway Service API

Back-End servise for user authentication, authorization and administration.

---
## Requirements

- TypeScript
- Node.js/KOA
- MariaDB local instanse
- Redis
- Google Peoples API
- Notification Service API
- Intergration Service API
- .env file vith keys  

---
## Enviroment variables list

- PORT - Node.js server local port number
- TOKEN_SECRET - JSON Web Token sekret key
- TOKEN_LIFE - expiration time for JSON Web Token
- TOKEN_LIFE_LONG - expiration time for JSON Web Token (if Remember Password enabled)
- DB_PASSWORD - MariaDB password
- BASE_URL - Auth API base url (default http://localhost:5001/)
- NOTIF_URL - Notification API base url (default http://localhost:3000/)
- GOOGLE_CLIENT_ID - Google OAuth2 client credentials
- GOOGLE_CLIENT_SECRET - Google OAuth2 client credentials

---
## Install

    $ git clone https://github.com/se-infotech-internship/server.auth
    $ cd server.auth
    $ npm i

---
## Configure app

Create .env file in project root folder and paste all API keys.

---
## Running the project

    $ npm run str
