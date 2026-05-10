import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── CONFIG ───
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── PARSE EXCEL ───
async function getExcelMapping() {
    const excelPath = '../docs/Aavishkar Pravah 2.0 Registration details.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const usnToTeam = {};

    for (const name of workbook.SheetNames) {
        const worksheet = workbook.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let currentTeamNo = null;
        let currentTeamName = null;

        for (const row of rows) {
            if (!row || row.length === 0) continue;
            
            const teamNoValue = row[0];
            const teamNameValue = row[1];
            const usnValue = row[2];

            if (typeof teamNoValue === 'string' && teamNoValue.trim().toUpperCase().startsWith('TEAM NO')) {
                continue;
            }

            if (teamNoValue !== undefined && teamNoValue !== null) {
                const parsedNo = parseInt(teamNoValue);
                if (!isNaN(parsedNo)) {
                    currentTeamNo = parsedNo;
                    currentTeamName = teamNameValue ? String(teamNameValue).trim() : null;
                }
            }

            if (usnValue && currentTeamNo !== null) {
                const usn = String(usnValue).trim().toUpperCase();
                if (usn && usn !== 'USN NUMBER') {
                    usnToTeam[usn] = {
                        teamNumber: currentTeamNo,
                        teamName: currentTeamName
                    };
                }
            }
        }
    }
    return usnToTeam;
}

// ─── MAIN ───
async function updateTeams() {
    console.log('📊 Parsing Excel file...');
    const usnToTeam = await getExcelMapping();
    console.log(`✅ Parsed ${Object.keys(usnToTeam).length} USN mappings.`);

    console.log('🔥 Fetching registrations from Firestore...');
    const snapshot = await db.collection('registrations').get();
    console.log(`✅ Found ${snapshot.size} registrations.`);

    let batch = db.batch();
    let count = 0;
    let matchCount = 0;
    let opsInBatch = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const leaderUSN = data.leaderUSN ? data.leaderUSN.trim().toUpperCase() : null;
        const members = data.members || [];
        
        let teamInfo = null;

        // Try to match by leader USN
        if (leaderUSN && usnToTeam[leaderUSN]) {
            teamInfo = usnToTeam[leaderUSN];
        } else {
            // Try to match by member USNs
            for (const member of members) {
                const musn = member.usn ? member.usn.trim().toUpperCase() : null;
                if (musn && usnToTeam[musn]) {
                    teamInfo = usnToTeam[musn];
                    break;
                }
            }
        }

        if (teamInfo) {
            batch.update(doc.ref, {
                teamNumber: teamInfo.teamNumber,
                teamName: teamInfo.teamName || data.leaderName // Fallback to leader name if no team name
            });
            matchCount++;
            opsInBatch++;
        }

        count++;
        if (opsInBatch >= 400) {
            await batch.commit();
            console.log(`  Committed batch. Total updated: ${matchCount}`);
            batch = db.batch();
            opsInBatch = 0;
        }
    }

    if (opsInBatch > 0) {
        await batch.commit();
    }

    console.log(`\n🎉 Done! Updated ${matchCount} teams with registration numbers.`);
    console.log(`${snapshot.size - matchCount} registrations could not be matched with the Excel data.`);
}

updateTeams().catch(console.error);
