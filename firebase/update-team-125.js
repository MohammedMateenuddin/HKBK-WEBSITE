import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function updateTeam125() {
    const email = 'vishalssollapure@gmail.com';
    const docRef = db.collection('registrations').doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
        console.error('❌ Registration not found!');
        return;
    }

    const data = doc.data();
    console.log('Current members:', JSON.stringify(data.members));

    // 1. Replace G Vishnuvardhan with Advaith
    // 2. Change USN 1di25ci056 to 1di25ci041
    const updatedMembers = data.members.map(m => {
        let member = { ...m };
        
        // Check by name or USN for Vishnuvardhan
        if (member.name === 'G Vishnuvardhan' || member.usn === '1di25ci019') {
            member.name = 'advaith';
            member.usn = '1diec002';
        }

        // Change USN 1di25ci056 to 1di25ci041 (might be a different member)
        if (member.usn === '1di25ci056') {
            member.usn = '1di25ci041';
        }

        return member;
    });

    // Also check leader USN if it matches the requested changes
    let updatedLeaderUSN = data.leaderUSN;
    if (updatedLeaderUSN === '1di25ci056') updatedLeaderUSN = '1di25ci041';

    await docRef.update({ 
        members: updatedMembers,
        leaderUSN: updatedLeaderUSN
    });

    console.log('✅ Team 125 updated successfully.');
}

updateTeam125().catch(console.error);
