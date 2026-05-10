import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function findAndReplace() {
    const snapshot = await db.collection('registrations').get();
    let target = null;
    let foundEmail = null;

    snapshot.forEach(doc => {
        const data = doc.data();
        // Check members
        const hasWasim = data.members?.some(m => m.name.toLowerCase().includes('wasim') || m.usn.toLowerCase().includes('1hk24is066') || m.usn.toLowerCase().includes('1hk24is001'));
        // Check leader
        const isWasimLeader = data.leaderName?.toLowerCase().includes('wasim') || data.leaderUSN?.toLowerCase().includes('1hk24is066') || data.leaderUSN?.toLowerCase().includes('1hk24is001');
        
        if (hasWasim || isWasimLeader) {
            console.log(`MATCH FOUND IN EMAIL: ${doc.id}`);
            console.log(JSON.stringify(data, null, 2));
            console.log("------------------");
        }
    });
}

findAndReplace().catch(console.error);
