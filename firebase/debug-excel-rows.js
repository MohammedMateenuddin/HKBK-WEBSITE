import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function debugRows() {
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('Total rows:', rows.length);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] && String(row[0]).includes('127')) {
            console.log(`Row ${i}:`, JSON.stringify(row));
            // Print next 20 rows
            for(let j=1; j<=20; j++) {
                console.log(`Row ${i+j}:`, JSON.stringify(rows[i+j]));
            }
            return;
        }
    }
    console.log('Could not find 127 in column 0');
}

debugRows();
