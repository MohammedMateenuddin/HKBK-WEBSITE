import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function removeSafalTeam() {
    const email = '1hk24is095@hkbk.edu.in';
    
    try {
        console.log(`Removing registration for ${email}...`);
        await db.collection('registrations').doc(email).delete();
        
        // Also check if they created a team document
        const teamSnap = await db.collection('teams').where('leaderEmail', '==', email).get();
        if (!teamSnap.empty) {
            for (const doc of teamSnap.docs) {
                console.log(`Removing team document: ${doc.id}`);
                await db.collection('teams').doc(doc.id).delete();
            }
        }
        
        console.log(`✅ Successfully removed ${email} and associated data from Firestore!`);
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

removeSafalTeam();
