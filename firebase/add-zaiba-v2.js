import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function addZaibaV2() {
    const email = 'zaibakulsum09@gmail.com';
    const data = {
        email: email,
        leaderName: 'Zaiba Kulsum',
        leaderUSN: '1HK25AI122',
        college: 'HKBK COLLEGE OF ENGINEERING',
        branch: 'aiml',
        semester: '2',
        section: 'N/A', // Not specified in screenshot
        mobile: '9945393946',
        paymentStatus: 'paid',
        teamNumber: 90,
        members: [
            { name: 'Nida Fathima', usn: '' },
            { name: 'Mohammed Samiya Siddiqui', usn: '' },
            { name: 'Zunaira Taskeen', usn: '' }
        ],
        status: 'Active',
        registrationSource: 'manual'
    };

    console.log(`🚀 Adding registration for ${email} (Team 90)...`);
    await db.collection('registrations').doc(email).set(data);
    console.log('✅ Registration added successfully.');
}

addZaibaV2().catch(console.error);
