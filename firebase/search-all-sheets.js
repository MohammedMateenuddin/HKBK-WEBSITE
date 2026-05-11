import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function searchAllSheets(text) {
    const workbook = XLSX.readFile(excelPath);
    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.some(cell => String(cell).includes(text))) {
                console.log(`✨ Found "${text}" in sheet "${sheetName}" at Row ${i}:`, JSON.stringify(row));
                return; // Just find one to start with
            }
        }
    }
    console.log(`❌ "${text}" not found in any sheet.`);
}

searchAllSheets('127');
searchAllSheets('145');
