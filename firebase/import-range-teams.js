import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import XLSX from 'xlsx';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

const excelPath = '../docs/anvishkar final (1).xlsx';

async function importTeams() {
    const workbook = XLSX.readFile(excelPath);
    const teams = {};

    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let currentTeam = null;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const teamNoVal = row[0];
            if (teamNoVal && !isNaN(parseInt(teamNoVal))) {
                const teamNo = parseInt(teamNoVal);
                if (teamNo >= 127 && teamNo <= 145) {
                    currentTeam = {
                        teamNumber: teamNo,
                        teamName: String(row[1] || row[3]).trim(),
                        leaderUSN: String(row[2]).trim().toLowerCase(),
                        leaderName: String(row[3]).trim(),
                        college: String(row[4] || "HKBK College of Engineering").trim(),
                        branch: String(row[5]).trim(),
                        mobile: String(row[6]).trim(),
                        members: [],
                        paymentStatus: 'paid', // Verified as requested
                        status: 'Active',
                        registrationSource: 'bulk-import'
                    };
                    teams[teamNo] = currentTeam;
                } else {
                    currentTeam = null;
                }
            } else if (currentTeam && row[2] && row[3]) {
                // Member row (has USN and Name but no Team No)
                currentTeam.members.push({
                    usn: String(row[2]).trim().toLowerCase(),
                    name: String(row[3]).trim()
                });
            }
        }
    }

    console.log(`📦 Found ${Object.keys(teams).length} teams in range 127-145.`);

    for (const teamNo of Object.keys(teams).sort((a,b) => a-b)) {
        const team = teams[teamNo];
        const email = `${team.leaderUSN}@hkbk.edu.in`;
        team.email = email;

        console.log(`🚀 Processing Team ${teamNo}: ${team.leaderName} (${email})`);

        try {
            // 1. Authenticate (Create user if not exists)
            try {
                await auth.getUserByEmail(email);
                console.log(`   ✅ Auth user already exists: ${email}`);
            } catch (e) {
                if (e.code === 'auth/user-not-found') {
                    await auth.createUser({
                        email: email,
                        password: 'Hkbk@' + team.leaderUSN.slice(-3), // Default password
                        displayName: team.leaderName
                    });
                    console.log(`   ✨ Auth user created: ${email}`);
                } else {
                    throw e;
                }
            }

            // 2. Add to Firestore
            await db.collection('registrations').doc(email).set(team);
            console.log(`   ✅ Firestore registration added.`);

        } catch (error) {
            console.error(`   ❌ Error processing Team ${teamNo}:`, error.message);
        }
    }

    console.log('🏁 All done.');
}

importTeams().catch(console.error);
