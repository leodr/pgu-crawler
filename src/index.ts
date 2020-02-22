import * as admin from 'firebase-admin';
import hash from 'object-hash';
import firebaseCredentials from '../firebase-credentials.json';
import deleteFirebaseCollection from './index/deleteFirebaseCollection';
import getCalendar from './index/getCalendar';
import getCanteen from './index/getCanteen';
import getNews from './index/getNews';

const serviceAccount = {
    type: firebaseCredentials.type,
    projectId: firebaseCredentials.project_id,
    privateKeyId: firebaseCredentials.private_key_id,
    privateKey: firebaseCredentials.private_key,
    clientEmail: firebaseCredentials.client_email,
    clientId: firebaseCredentials.client_id,
    authUri: firebaseCredentials.auth_uri,
    tokenUri: firebaseCredentials.token_uri,
    authProviderX509CertUrl: firebaseCredentials.auth_provider_x509_cert_url,
    clientC509CertUrl: firebaseCredentials.client_x509_cert_url,
};

const main = async (): Promise<void> => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://pgu-app.firebaseio.com',
    });

    const news = await getNews();
    const calendarEntries = await getCalendar();
    const canteenUrl = await getCanteen();

    const db = admin.firestore();
    const batch = db.batch();

    for (const newsArticle of news) {
        const docRef = db.collection('news').doc(newsArticle.slug);

        batch.set(docRef, newsArticle);
    }

    await deleteFirebaseCollection(batch, 'calendar');

    for (const calendarEntry of calendarEntries) {
        const key = hash(calendarEntry, { algorithm: 'md5' });

        const calendarRef = db.collection('calendar').doc(key);

        batch.set(calendarRef, calendarEntry);
    }

    const canteenUrlRef = db.collection('canteen').doc('canteenUrl');

    batch.set(canteenUrlRef, { canteenUrl });

    batch.commit();
};

main();
