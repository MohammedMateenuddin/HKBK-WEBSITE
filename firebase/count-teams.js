import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function countTeamsInSheet(name) {
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    let count = 0;
    let maxTeam = 0;
    rows.forEach(row => {
        if (row[0] && !isNaN(parseInt(row[0]))) {
            count++;
            maxTeam = Math.max(maxTeam, parseInt(row[0]));
        }
    });
    console.log(`Sheet ${name}: ${count} teams, max team no: ${maxTeam}`);
}

countTeamsInSheet('Sheet1');
countTeamsInSheet('Sheet2');
countTeamsInSheet('Sheet3');
countTeamsInSheet('Sheet4');
countTeamsInSheet('Sheet5');
