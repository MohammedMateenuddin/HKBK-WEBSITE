import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function cleanup() {
    const gmailEmail = 'zaibakulsum09@gmail.com';
    const collegeEmail = '1hk24ai121@hkbk.edu.in';

    console.log(`🗑️ Removing registration: ${gmailEmail}`);
    await db.collection('registrations').doc(gmailEmail).delete();
    
    console.log(`🔄 Updating registration for ${collegeEmail} to Zaiba Kulsum...`);
    await db.collection('registrations').doc(collegeEmail).update({
        leaderName: 'Zaiba Kulsum',
        leaderUSN: '1hk24ai119',
        // Keeping other details or updating them? 
        // Let's ensure the members list is correct (swapping Ziyafatima into members)
        members: [
            { name: 'Rubina Mehreen', usn: '1hk24ai089' },
            { name: 'Ziyafatima Mallur', usn: '1hk24ai121' },
            { name: 'Maera fatima', usn: '1hk24ai049' }
        ]
    });

    console.log('✅ Done.');
}

cleanup().catch(console.error);
