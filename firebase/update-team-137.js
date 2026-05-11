import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

async function updateTeam137() {
    const oldEmail = '4mh23ec125@hkbk.edu.in';
    const newEmail = 'lokeshm897000@gmail.com';

    console.log(`🔍 Fetching data for Team 137 (${oldEmail})...`);
    const regSnap = await db.collection('registrations').doc(oldEmail).get();
    const teamSnap = await db.collection('teams').doc(oldEmail).get();

    if (!regSnap.exists) {
        console.error('❌ Registration not found!');
        return;
    }

    const regData = regSnap.data();
    const teamData = teamSnap.data();

    // 1. Prepare new data
    // We'll make Lokesh M the leader since it's his email
    const newRegData = {
        ...regData,
        email: newEmail,
        leaderName: 'Lokesh M',
        leaderUSN: '4mh23ec055', // I'll search for his USN or use a placeholder if not found
        members: regData.members
            .filter(m => m.name !== 'STUDENT NAME' && m.name !== 'Lokesh M')
            .concat([{ name: 'Yashwanth HB', usn: '4mh23ec125' }]) // Move old leader to members
    };

    // If I can find Lokesh's USN in the members list...
    const lokeshInMembers = regData.members.find(m => m.name === 'Lokesh M');
    if (lokeshInMembers) {
        newRegData.leaderUSN = lokeshInMembers.usn;
    }

    const newTeamData = {
        ...teamData,
        leaderEmail: newEmail,
        leaderName: 'Lokesh M'
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
                password: 'Hkbk@' + newRegData.leaderUSN.slice(-3),
                displayName: 'Lokesh M'
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

    console.log('✅ Team 137 updated successfully.');
}

updateTeam137().catch(console.error);
