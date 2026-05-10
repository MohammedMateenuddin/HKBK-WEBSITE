import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
    const doc = await db.collection('registrations').doc('mohammedabdulhannan1360@gmail.com').get();
    console.log(JSON.stringify(doc.data(), null, 2));
}

check().catch(console.error);
