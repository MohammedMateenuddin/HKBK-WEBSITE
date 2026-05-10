import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function restoreSafalTeam() {
    const email = '1hk24is095@hkbk.edu.in';
    const teamData = {
        email: email,
        leaderName: 'Safal Sadanand Kalakamb',
        leaderUSN: '1HK24IS095',
        members: [
            { name: 'Taqweer S', usn: '1HK24IS114' },
            { name: 'Mohammed Afroz', usn: '1HK24IS074' },
            { name: 'Umar Shazada', usn: '1HK24IS118' }
        ],
        semester: '4',
        section: 'B',
        branch: 'Ise',
        college: 'HKBK College of Engineering',
        mobile: '9353846767',
        rawTxn: 'T2605070916466566186450 / 07-05-2026',
        paymentStatus: 'paid'
    };

    try {
        console.log(`Restoring team for ${email}...`);
        await db.collection('registrations').doc(email).set(teamData, { merge: true });
        console.log('✅ Successfully restored Safal\'s paid team to Firestore!');
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

restoreSafalTeam();
