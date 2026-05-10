import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function replaceMember() {
    const email = 'spikeyimpact@gmail.com';
    const docRef = db.collection('registrations').doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
        console.log(`❌ Team ${email} not found!`);
        return;
    }

    const data = doc.data();
    const oldMembers = data.members || [];
    
    // Replace Wasim (1HK24IS001) with Afshan Khan (1HK24IS009)
    const updatedMembers = oldMembers.map(m => {
        if (m.usn.toUpperCase() === '1HK24IS001') {
            console.log(`  -> Found match: ${m.name} (${m.usn}). Replacing...`);
            return { name: 'Afshan Khan', usn: '1HK24IS009' };
        }
        return m;
    });

    await docRef.update({
        members: updatedMembers
    });

    console.log(`✅ Done! Successfully updated team members for ${email}`);
    console.log(`New Member List:`, JSON.stringify(updatedMembers, null, 2));
}

replaceMember().catch(console.error);
