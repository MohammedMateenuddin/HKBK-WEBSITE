import XLSX from 'xlsx';
const workbook = XLSX.readFile('../docs/anvishkar final (1).xlsx');
const name = 'Sheet43';
const worksheet = workbook.Sheets[name];
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
rows.forEach((row, i) => {
    if (row[0] && !isNaN(parseInt(row[0]))) {
        console.log(`Team ${row[0]} found at Row ${i} in ${name}`);
    }
});
