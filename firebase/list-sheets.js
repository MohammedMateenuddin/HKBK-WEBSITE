import XLSX from 'xlsx';
const workbook = XLSX.readFile('../docs/anvishkar final (1).xlsx');
console.log('SheetNames:', workbook.SheetNames);
