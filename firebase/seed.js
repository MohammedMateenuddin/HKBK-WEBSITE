import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── CONFIG ───
// 1. Download your Firebase service account key JSON from:
//    Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// 2. Save it as 'serviceAccountKey.json' in this folder
// 3. Run: npm install && npm run seed

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── CSV PARSER ───
function parseCSVRow(row) {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '"') { if (inQ && row[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
        else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
        else cur += ch;
    }
    result.push(cur);
    return result;
}

// ─── MAIN ───
async function seed() {
    const csvPath = '../docs/1 day workshop +24 hours hackathon in Collaboration with  updated count (3).csv';
    const text = readFileSync(csvPath, 'utf8');
    const rows = text.split('\n').slice(1).filter(r => r.trim());

    const registrations = {};
    const skip = ['nil', '-', '', '0', 'na', 'n/a'];

    for (const row of rows) {
        const c = parseCSVRow(row);
        if (c.length < 19) continue;
        const email = c[2].trim().toLowerCase();
        const status = c[17].trim().toLowerCase();
        if (status !== 'paid' || !email) continue;

        const members = [];
        [[c[5], c[6]], [c[7], c[8]], [c[9], c[10]]].forEach(([n, u]) => {
            const name = n.trim(), usn = u.trim();
            if (!skip.includes(name.toLowerCase()) && !skip.includes(usn.toLowerCase())) {
                members.push({ name, usn });
            }
        });

        // Last occurrence wins (handles duplicate submissions)
        registrations[email] = {
            email,
            leaderName: c[3].trim(),
            leaderUSN: c[4].trim(),
            members,
            semester: c[11].trim(),
            section: c[12].trim(),
            branch: c[13].trim(),
            college: c[14].trim(),
            mobile: c[16].trim(),
            rawTxn: c[18].trim(),
            paymentStatus: 'paid'
        };
    }

    // ─── INJECT TEST EMAILS ───
    const testEmails = [
        'boyzkiller9876@gmail.com',
        'mohammedraheesh284@gmail.com',
        'mateenuddin987@gmail.com',
        'naumaanmohammed96@gmail.com'
    ];

    for (const testEmail of testEmails) {
        if (!registrations[testEmail]) {
            registrations[testEmail] = {
                email: testEmail,
                leaderName: 'Test Leader (' + testEmail.split('@')[0] + ')',
                leaderUSN: '1HKTEST001',
                members: [
                    { name: 'Test Member 1', usn: '1HKTEST002' }
                ],
                semester: '6th',
                section: 'A',
                branch: 'CSE',
                college: 'HKBK College of Engineering',
                mobile: '9876543210',
                rawTxn: 'TEST_TXN',
                paymentStatus: 'paid'
            };
        }
    }

    const emails = Object.keys(registrations);
    console.log(`\n📋 Parsed ${emails.length} unique paid registrations from CSV\n`);

    // Batch write to Firestore (max 500 per batch)
    const BATCH_SIZE = 400;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = emails.slice(i, i + BATCH_SIZE);
        for (const email of chunk) {
            const docRef = db.collection('registrations').doc(email);
            batch.set(docRef, registrations[email], { merge: true });
        }
        await batch.commit();
        console.log(`  ✅ Seeded batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs`);
    }

    console.log(`\n🎉 Done! ${emails.length} registrations seeded to Firestore.\n`);
    console.log('Firestore collections created:');
    console.log('  - registrations (email → team data)');
    console.log('\nYou can now run the website and teams can log in!\n');
}

seed().catch(console.error);
