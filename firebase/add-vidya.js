import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function addVidyaTeam() {
    const email = '1hk24is102@hkbk.edu.in';
    const teamData = {
        email: email,
        leaderName: 'Vidya T',
        leaderUSN: '1HK24EC160',
        members: [
            { name: 'Omkari', usn: '1HK24IS079' },
            { name: 'Sanika S D', usn: '1HK24EC125' },
            { name: 'Sharanbasava', usn: '1HK24IS102' }
        ],
        semester: '4',
        section: 'B',
        branch: 'ISE/ECE',
        college: 'Hkbk college of engineering',
        mobile: '9945607227',
        rawTxn: '002154725220 (08-06-26)',
        paymentStatus: 'paid'
    };

    try {
        console.log(`Adding team for ${email}...`);
        await db.collection('registrations').doc(email).set(teamData, { merge: true });
        console.log('✅ Successfully added Vidya T\'s team to Firestore!');
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

addVidyaTeam();
