import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

async function updateTeam138() {
    const oldEmail = '4mh23cb027@hkbk.edu.in';
    const newEmail = 'chethanagt18@gmail.com';

    console.log(`🔍 Fetching data for Team 138 (${oldEmail})...`);
    const regSnap = await db.collection('registrations').doc(oldEmail).get();
    const teamSnap = await db.collection('teams').doc(oldEmail).get();

    if (!regSnap.exists) {
        console.error('❌ Registration not found!');
        return;
    }

    const regData = regSnap.data();
    const teamData = teamSnap.data();

    // 1. Prepare new data
    // We'll make Chethana G T the leader
    const newRegData = {
        ...regData,
        email: newEmail,
        leaderName: 'Chethana G T',
        leaderUSN: '4mh23cb013', // USN for Chethana
        members: regData.members
            .filter(m => m.name !== 'Chethana G T')
            .concat([{ name: 'Nimisha E', usn: '4mh23cb027' }]) // Move Nimisha to members
    };

    // Find Chethana's actual USN if present
    const chethanaInMembers = regData.members.find(m => m.name === 'Chethana G T');
    if (chethanaInMembers) {
        newRegData.leaderUSN = chethanaInMembers.usn;
    }

    const newTeamData = {
        ...teamData,
        leaderEmail: newEmail,
        leaderName: 'Chethana G T'
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
                displayName: 'Chethana G T'
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

    console.log('✅ Team 138 updated successfully.');
}

updateTeam138().catch(console.error);
