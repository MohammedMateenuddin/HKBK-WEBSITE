import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

async function updateTeam130() {
    const oldEmail = '24suubeaml495@hkbk.edu.in';
    const newEmail = 'rishik1706@gmail.com';

    console.log(`🔍 Fetching data for Team 130 (${oldEmail})...`);
    const regSnap = await db.collection('registrations').doc(oldEmail).get();
    const teamSnap = await db.collection('teams').doc(oldEmail).get();

    if (!regSnap.exists) {
        console.error('❌ Registration not found!');
        return;
    }

    const regData = regSnap.data();
    const teamData = teamSnap.data();

    // 1. Prepare new data
    const newRegData = {
        ...regData,
        email: newEmail,
        members: regData.members.filter(m => m.name !== 'STUDENT NAME')
    };

    const newTeamData = {
        ...teamData,
        leaderEmail: newEmail
    };

    console.log(`🚀 Migrating documents to ${newEmail}...`);

    // 2. Auth
    try {
        await auth.getUserByEmail(newEmail);
        console.log(`   ✅ Auth user already exists: ${newEmail}`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await auth.createUser({
                email: newEmail,
                password: 'Hkbk@' + regData.leaderUSN.slice(-3),
                displayName: regData.leaderName
            });
            console.log(`   ✨ Auth user created: ${newEmail}`);
        } else {
            throw e;
        }
    }

    // 3. Firestore
    await db.collection('registrations').doc(newEmail).set(newRegData);
    if (teamSnap.exists) {
        await db.collection('teams').doc(newEmail).set(newTeamData);
    }

    console.log(`🗑️ Deleting old documents for ${oldEmail}...`);
    await db.collection('registrations').doc(oldEmail).delete();
    await db.collection('teams').doc(oldEmail).delete();

    console.log('✅ Team 130 updated successfully.');
}

updateTeam130().catch(console.error);
