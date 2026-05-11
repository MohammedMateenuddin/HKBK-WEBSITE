import XLSX from 'xlsx';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const docsDir = '../docs';
const targetEmail = 'zaibakulsum09@gmail.com';

function searchInFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.xlsx' || ext === '.csv') {
        const workbook = XLSX.readFile(filePath);
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row.some(cell => String(cell).toLowerCase().includes(targetEmail.toLowerCase()))) {
                    console.log(`✨ Found in ${path.basename(filePath)} (Sheet: ${sheetName}, Row: ${i + 1}):`);
                    console.log(JSON.stringify(row, null, 2));
                    return row;
                }
            }
        }
    }
    return null;
}

const files = readdirSync(docsDir);
console.log(`📂 Searching for ${targetEmail} in ${docsDir}...`);
let found = false;
for (const file of files) {
    const result = searchInFile(path.join(docsDir, file));
    if (result) found = true;
}

if (!found) {
    console.log('❌ Not found in any local doc files.');
}
