import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function fixNameTypo() {
    const email = '1hk25cs009@hkbk.edu.in';
    const docRef = db.collection('registrations').doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
        console.error('❌ Registration not found!');
        return;
    }

    const data = doc.data();
    const members = data.members.map(m => {
        if (m.name === 'Mohammed Zuhaib Wani') {
            return { ...m, name: 'Mohammad Zuhaib Wani' };
        }
        return m;
    });

    await docRef.update({ members });
    console.log('✅ Name corrected for Mohammad Zuhaib Wani in Team 129.');
}

fixNameTypo().catch(console.error);
