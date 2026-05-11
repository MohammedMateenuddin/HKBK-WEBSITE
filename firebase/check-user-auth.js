import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function checkUser(email) {
    console.log(`🔍 Checking status for: ${email}`);
    
    try {
        const userRecord = await auth.getUserByEmail(email);
        console.log('✅ Firebase Auth: User exists');
        console.log(`   - UID: ${userRecord.uid}`);
        console.log(`   - Email Verified: ${userRecord.emailVerified}`);
        console.log(`   - Creation Time: ${userRecord.metadata.creationTime}`);
        console.log(`   - Last SignIn: ${userRecord.metadata.lastSignInTime}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log('❌ Firebase Auth: User NOT found');
        } else {
            console.error('🔥 Auth Error:', error.message);
        }
    }

    try {
        const doc = await db.collection('registrations').doc(email).get();
        if (doc.exists) {
            console.log('✅ Firestore (registrations): Document exists');
            // console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log('❌ Firestore (registrations): Document NOT found');
        }
        
        // Also check if they are a member in someone else's team
        const memberSnapshot = await db.collection('registrations')
            .where('members', 'array-contains', { email: email })
            .get();
        
        if (!memberSnapshot.empty) {
            console.log(`✅ Firestore: Found as member in ${memberSnapshot.size} team(s)`);
        } else {
            // Try searching by email string if the array contains just strings or different object structure
            const allRegs = await db.collection('registrations').get();
            let foundAsMember = false;
            allRegs.forEach(doc => {
                const data = doc.data();
                if (data.members && Array.isArray(data.members)) {
                    const isMember = data.members.some(m => {
                        if (typeof m === 'string') return m.toLowerCase() === email.toLowerCase();
                        if (m.email) return m.email.toLowerCase() === email.toLowerCase();
                        return false;
                    });
                    if (isMember) {
                        foundAsMember = true;
                        console.log(`✅ Firestore: Found as member in team led by ${doc.id}`);
                    }
                }
            });
            if (!foundAsMember) {
                console.log('❌ Firestore: Not found as a member in any team');
            }
        }

    } catch (error) {
        console.error('🔥 Firestore Error:', error.message);
    }
}

const targetEmail = 'zaibakulsum09@gmail.com';
checkUser(targetEmail).catch(console.error);
