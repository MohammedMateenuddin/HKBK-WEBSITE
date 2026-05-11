import XLSX from 'xlsx';
import path from 'path';

const excelPath = '../docs/anvishkar final (1).xlsx';

async function inspectExcel() {
    try {
        const workbook = XLSX.readFile(excelPath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('📄 Sheet Name:', firstSheetName);
        console.log('📊 First 5 rows:');
        rows.slice(0, 5).forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });

        // Find Team 127 to see where it starts
        console.log('\n🔍 Searching for Team 127...');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.some(cell => String(cell).includes('127'))) {
                console.log(`✨ Found Team 127 at Row ${i + 1}:`, JSON.stringify(row));
                break;
            }
        }
    } catch (error) {
        console.error('🔥 Error reading Excel:', error.message);
    }
}

inspectExcel();
