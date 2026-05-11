import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

async function addTeam146() {
    const email = 'daniya.mehran6002@gmail.com';
    const teamNo = 146;
    
    const regData = {
        email: email,
        leaderName: 'Daniya Mehran',
        leaderUSN: '1HK24CS066',
        teamName: 'Hackoholics',
        college: 'HKBK College of Engineering',
        branch: 'cs',
        mobile: '8618296577',
        teamNumber: teamNo,
        members: [
            { name: 'Atiya Afshan', usn: '1HK24CS037' },
            { name: 'Mohammed Arfath', usn: '1HK24CS142' },
            { name: 'Zara Kulsum', usn: '1HK24CS322' }
        ],
        paymentStatus: 'paid',
        status: 'Active',
        registrationSource: 'manual'
    };

    const teamData = {
        teamName: 'Hackoholics',
        leaderEmail: email,
        leaderName: 'Daniya Mehran',
        githubRepo: '',
        createdAt: FieldValue.serverTimestamp(),
        teamNumber: teamNo
    };

    console.log(`🚀 Adding Team ${teamNo} for ${email}...`);

    // 1. Auth
    try {
        await auth.getUserByEmail(email);
        console.log(`   ✅ Auth user already exists: ${email}`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await auth.createUser({
                email: email,
                password: 'Hkbk@' + regData.leaderUSN.slice(-3),
                displayName: 'Daniya Mehran'
            });
            console.log(`   ✨ Auth user created: ${email}`);
        } else {
            throw e;
        }
    }

    // 2. Firestore
    await db.collection('registrations').doc(email).set(regData);
    await db.collection('teams').doc(email).set(teamData);
    console.log(`   ✅ Firestore documents created.`);

    console.log('🏁 Done.');
}

addTeam146().catch(console.error);
