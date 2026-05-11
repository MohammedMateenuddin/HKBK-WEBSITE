import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function addZaiba() {
    const email = 'zaibakulsum09@gmail.com';
    const data = {
        email: email,
        leaderName: 'Zaiba Kulsum',
        leaderUSN: '1hk24ai119',
        college: 'Hkbk college of Engineering',
        branch: 'AIML',
        semester: '4',
        section: 'Mix of A & B',
        mobile: '9353715454',
        paymentStatus: 'paid',
        teamNumber: 6,
        members: [
            { name: 'Rubina Mehreen', usn: '1hk24ai089' },
            { name: 'Ziyafatima Mallur', usn: '1hk24ai121' },
            { name: 'Maera fatima', usn: '1hk24ai049' }
        ]
    };

    console.log(`🚀 Adding registration for ${email}...`);
    await db.collection('registrations').doc(email).set(data);
    console.log('✅ Registration added successfully.');

    // Also check if we should create a team doc to avoid the modal
    // But maybe she wants to pick her own team name?
    // Let's just do the registration for now so she can at least log in.
}

addZaiba().catch(console.error);
