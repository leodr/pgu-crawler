import * as admin from 'firebase-admin';
import hash from 'object-hash';
import deleteFirebaseCollection from './index/deleteFirebaseCollection';
import credential, { databaseUrl } from './index/firebaseCredentials';
import getCalendar from './index/getCalendar';
import getCanteen from './index/getCanteen';
import getNews from './index/getNews';

const main = async (): Promise<void> => {
    admin.initializeApp({
        credential: credential,
        databaseURL: databaseUrl,
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
