import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function searchHussain() {
    const snapshot = await db.collection('registrations').get();
    snapshot.forEach(doc => {
        const data = doc.data();
        const txt = JSON.stringify(data).toLowerCase();
        if (txt.includes('hussain')) {
            console.log(`MATCH: ${doc.id}`);
            console.log(JSON.stringify(data, null, 2));
            console.log("---------------");
        }
    });
}

searchHussain().catch(console.error);
