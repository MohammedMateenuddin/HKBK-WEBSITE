import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function createTeamDocs() {
    const registrations = await db.collection('registrations')
        .where('teamNumber', '>=', 127)
        .where('teamNumber', '<=', 145)
        .get();

    console.log(`📦 Found ${registrations.size} registrations to create team documents for.`);

    for (const doc of registrations.docs) {
        const reg = doc.data();
        const email = doc.id;

        console.log(`🚀 Creating team doc for: ${reg.teamName} (${email})`);

        await db.collection('teams').doc(email).set({
            teamName: reg.teamName,
            leaderEmail: email,
            leaderName: reg.leaderName,
            githubRepo: '',
            createdAt: FieldValue.serverTimestamp(),
            teamNumber: reg.teamNumber // Added this as it's useful
        }, { merge: true });
    }

    console.log('✅ All team documents created.');
}

createTeamDocs().catch(console.error);
