import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function deleteUser() {
    const email = 'sumithchougale1008@gmail.com';
    console.log(`Attempting to delete: ${email}`);
    
    const docRef = db.collection('registrations').doc(email);
    const snap = await docRef.get();
    
    if (snap.exists) {
        await docRef.delete();
        console.log(`✅ Successfully deleted ${email} from database.`);
    } else {
        console.log(`❌ Error: No document found for email ${email}`);
    }
}

deleteUser().catch(console.error);
