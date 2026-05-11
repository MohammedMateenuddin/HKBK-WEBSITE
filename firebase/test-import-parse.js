import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function parseTeams() {
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const teams = {};
    let currentTeamNo = null;
    let currentTeamName = null;

    for (let i = 5; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const teamNoVal = row[0];
        const teamNameVal = row[1];
        const usn = row[2] ? String(row[2]).trim().toUpperCase() : null;
        const name = row[3] ? String(row[3]).trim() : null;
        const college = row[4];
        const branch = row[5];
        const mobile = row[6];

        if (teamNoVal && !isNaN(parseInt(teamNoVal))) {
            currentTeamNo = parseInt(teamNoVal);
            currentTeamName = teamNameVal ? String(teamNameVal).trim() : null;
        }

        if (currentTeamNo >= 127 && currentTeamNo <= 145) {
            if (!teams[currentTeamNo]) {
                teams[currentTeamNo] = {
                    teamNumber: currentTeamNo,
                    teamName: currentTeamName || name,
                    leaderName: name,
                    leaderUSN: usn,
                    email: null, // We need to find the email or generate one?
                    college: college || "HKBK College of Engineering",
                    branch: branch,
                    mobile: mobile,
                    members: [],
                    paymentStatus: 'paid'
                };
            } else {
                // Subsequent rows are members
                if (usn && name) {
                    teams[currentTeamNo].members.push({ name, usn });
                }
            }
        }
    }
    return Object.values(teams);
}

const extracted = parseTeams();
console.log(`✅ Extracted ${extracted.length} teams.`);
extracted.forEach(t => {
    console.log(`Team ${t.teamNumber}: ${t.leaderName} (${t.leaderUSN}) - ${t.members.length} members`);
});
