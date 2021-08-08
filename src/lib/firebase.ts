import admin from 'firebase-admin';

const serviceAccount = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
});

export default admin;
