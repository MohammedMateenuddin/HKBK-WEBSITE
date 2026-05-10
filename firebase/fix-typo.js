import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fixTypo() {
    const oldEmail = 'brithvik74@gmail..com';
    const newEmail = 'brithvik74@gmail.com';
    
    console.log(`🔍 Searching for: ${oldEmail}...`);
    
    const oldDocRef = db.collection('registrations').doc(oldEmail);
    const snap = await oldDocRef.get();
    
    if (!snap.exists) {
        console.error(`❌ Document not found for ${oldEmail}`);
        process.exit(1);
    }
    
    const data = snap.data();
    // Ensure the stored email internal field matches new email too
    data.email = newEmail;
    
    console.log(`✅ Found data for ${data.leaderName || 'Leader'}. Migrating...`);
    
    // Create the new document
    await db.collection('registrations').doc(newEmail).set(data);
    console.log(`✨ Successfully created new entry: ${newEmail}`);
    
    // Delete the old document with typo
    await oldDocRef.delete();
    console.log(`🗑️ Deleted old entry with typo: ${oldEmail}`);
    
    console.log('🎉 Fix complete! The user can now log in instantly.');
}

fixTypo().catch(console.error);
