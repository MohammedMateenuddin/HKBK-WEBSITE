import XLSX from 'xlsx';

const excelPath = '../docs/anvishkar final (1).xlsx';

function dumpSheet(name) {
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`Dumping ${name}...`);
    rows.slice(0, 100).forEach((row, i) => {
        if (row.length > 0) console.log(`${i}:`, JSON.stringify(row));
    });
}

dumpSheet('Sheet1');
