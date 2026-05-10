import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkSafal() {
    const doc1 = await db.collection('registrations').doc('1hk24is114@hkbk.edu.in').get();
    console.log('1hk24is114@hkbk.edu.in exists:', doc1.exists);
    
    const doc2 = await db.collection('registrations').doc('1hk24is095@hkbk.edu.in').get();
    console.log('1hk24is095@hkbk.edu.in exists:', doc2.exists);
}

checkSafal();
