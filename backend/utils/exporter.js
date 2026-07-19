const ExcelJS = require('exceljs');

/** Builds an .xlsx buffer from an array of flat objects. */
async function buildExcel(rows, sheetName = 'Results') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Harvexa';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  if (!rows.length) {
    sheet.addRow(['No results']);
    return workbook.xlsx.writeBuffer();
  }

  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  sheet.columns = columns.map((key) => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key,
    width: Math.min(Math.max(key.length + 8, 16), 50),
  }));

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6C5CE7' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  rows.forEach((row) => {
    const flat = {};
    columns.forEach((c) => {
      const val = row[c];
      flat[c] = typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });
    sheet.addRow(flat);
  });

  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

  return workbook.xlsx.writeBuffer();
}

/** Builds a CSV string from an array of flat objects. */
function buildCsv(rows) {
  if (!rows.length) return 'no_results\n';
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escape = (val) => {
    if (val === undefined || val === null) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((c) => escape(row[c])).join(','));
  });
  return lines.join('\n');
}

module.exports = { buildExcel, buildCsv };
