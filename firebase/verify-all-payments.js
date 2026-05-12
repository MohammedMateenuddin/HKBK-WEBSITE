import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function verifyAllPayments() {
    console.log('🚀 Fetching all teams...');
    const teamsSnap = await db.collection('teams').get();
    const batch = db.batch();

    console.log(`📦 Found ${teamsSnap.size} teams. Marking as verified...`);
    teamsSnap.forEach(doc => {
        batch.update(doc.ref, { paymentVerified: true });
    });

    console.log('🚀 Fetching all registrations...');
    const regsSnap = await db.collection('registrations').get();
    console.log(`📦 Found ${regsSnap.size} registrations. Marking as paid...`);
    regsSnap.forEach(doc => {
        batch.update(doc.ref, { paymentStatus: 'paid' });
    });

    await batch.commit();
    console.log('✅ All payments verified and registrations marked as paid.');
}

verifyAllPayments().catch(console.error);
