import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function findText(text) {
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.some(cell => String(cell).includes(text))) {
            console.log(`Found "${text}" at Row ${i}:`, JSON.stringify(row));
        }
    }
}

findText('127');
