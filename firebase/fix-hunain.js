import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fixHunain() {
    console.log("Searching for leader 'huma' or member '1hk25cs128'...");
    const snap = await db.collection('registrations').get();
    let found = false;

    for (const doc of snap.docs) {
        const data = doc.data();
        const strData = JSON.stringify(data).toLowerCase();
        
        if (strData.includes('huma') || strData.includes('1hk25cs128') || strData.includes('intellicore')) {
            console.log(`\nFound potential match in doc ID: ${doc.id}`);
            console.log(JSON.stringify(data, null, 2));

            // Check if there's a member with name '1hk25cs128'
            if (data.members) {
                let updated = false;
                const newMembers = data.members.map(m => {
                    if (m.name && m.name.toLowerCase().includes('1hk25cs128')) {
                        console.log(`=> Changing member name from "${m.name}" to "Hunain"`);
                        updated = true;
                        return { ...m, name: 'Hunain' };
                    }
                    return m;
                });
                
                if (updated) {
                    await db.collection('registrations').doc(doc.id).update({ members: newMembers });
                    console.log(`=> ✅ Successfully updated doc ${doc.id} in Firestore`);
                }
            }
        }
    }
}

fixHunain().catch(console.error);
