import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

async function updateTeam134() {
    const oldEmail = '1hk23is013@hkbk.edu.in';
    const newEmail = 'suhanakhan3754@gmail.com';

    console.log(`🔍 Fetching data for Team 134 (${oldEmail})...`);
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
        leaderName: 'Suhana Khan',
        leaderUSN: '1hk23is049', // USN for Suhana
        members: [
            { name: 'ARSHIN', usn: '1hk23is013' }, // Old leader is now a member
            { name: 'RAZIQHA', usn: '1hk23is116' },
            { name: 'humaira', usn: '1hk23is034' }
        ]
    };

    const newTeamData = {
        ...teamData,
        leaderEmail: newEmail,
        leaderName: 'Suhana Khan'
    };

    // 2. Auth: Check if new email exists, create if not
    try {
        await auth.getUserByEmail(newEmail);
        console.log(`✅ Auth user already exists: ${newEmail}`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await auth.createUser({
                email: newEmail,
                password: 'Hkbk@' + newRegData.leaderUSN.slice(-3),
                displayName: 'Suhana Khan'
            });
            console.log(`✨ Auth user created: ${newEmail}`);
        } else {
            throw e;
        }
    }

    // 3. Firestore: Save new and delete old
    console.log(`🚀 Migrating documents to ${newEmail}...`);
    await db.collection('registrations').doc(newEmail).set(newRegData);
    await db.collection('teams').doc(newEmail).set(newTeamData);

    console.log(`🗑️ Deleting old documents for ${oldEmail}...`);
    await db.collection('registrations').doc(oldEmail).delete();
    await db.collection('teams').doc(oldEmail).delete();

    console.log('✅ Team 134 updated successfully.');
}

updateTeam134().catch(console.error);
