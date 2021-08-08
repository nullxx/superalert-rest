# SuperAlert rest api

<img src="https://i.ibb.co/BLZN8z9/ringing.png" alt="logo" width="200" style="display:block;margin:auto;"/>

**Simple** rest API to send notifications SuperAlert app:
* [Appstore](https://apps.apple.com/es/app/superalert/id1576722040)
* [Playstore](https://play.google.com/store/apps/details?id=me.nullx.alerter)

## Installation

```bash
git clone <repo_uri>
cd <repo_uri>
yarn
cp .env.example .env
yarn build
yarn start
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI`

`SECRET`

`PORT`

`FIREBASE_SERVICE_ACCOUNT_KEY`

  
## Usage

```console
❯ yarn start
yarn run v1.22.10
$ npm run serve

> superalert-rest@1.2.0 serve
> node -r dotenv/config dist/server.js

info: dist/server.js | DB connected!
info: dist/server.js | Listening on port 3000
```

  