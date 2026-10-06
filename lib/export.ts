import { DrawnRecord } from './types';

/**
 * Exports drawn numbers to CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportToCSV(records: DrawnRecord[], eventTitle: string = 'Pengundian Nomor') {
  if (!records || records.length === 0) return;

  const header = ['No. Urut', 'Nomor Undian', 'Waktu Pengundian', 'Nama Peserta'];
  const rows = records.map((r) => [
    r.order,
    `"${r.formattedNumber}"`, // Enclosed in quotes to preserve leading zeros in Excel
    `"${r.timestamp}"`,
    `"${r.prizeNote || '-'}"`,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    [`# ${eventTitle}`, `# Total Terundi: ${records.length}`, '']
      .join('\r\n') +
    '\r\n' +
    [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  link.setAttribute('href', url);
  link.setAttribute('download', `Hasil_Undian_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies formatted text summary of results to clipboard
 */
export async function copyResultsToClipboard(records: DrawnRecord[], eventTitle: string): Promise<boolean> {
  if (!records || records.length === 0) return false;

  const lines = [
    `=== HASIL ${eventTitle.toUpperCase()} ===`,
    `Total Pemenang Terundi: ${records.length}`,
    `Waktu Cetak: ${new Date().toLocaleString('id-ID')}`,
    '----------------------------------------',
    'No. | Nomor Undian | Waktu | Hadiah',
    '----------------------------------------',
    ...records.map(
      (r) =>
        `${String(r.order).padStart(3, ' ')} | ${r.formattedNumber.padEnd(12, ' ')} | ${r.timestamp} | ${
          r.prizeNote || '-'
        }`
    ),
    '----------------------------------------',
  ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    return true;
  } catch {
    return false;
  }
}
