import { ALL_PLATES_MAP } from '../constants';
import { PRRecord } from '../types';

/**
 * Exports gym lift history to a clean RFC 4180 compliant CSV file.
 * Automatically initiates download in the browser without any external APIs.
 */
export function exportHistoryToCSV(history: PRRecord[]): boolean {
  if (!history || history.length === 0) {
    return false;
  }

  // Sort chronological for clean spreadsheet reading
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const headers = [
    'Date',
    'Time',
    'Lift',
    'Total Weight (kg)',
    'Bar Weight (kg)',
    'Plates Per Sleeve',
    'Plates Total Count',
    'Body Weight (kg)',
    '% of Bodyweight',
    'Notes',
  ];

  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    // If string contains comma, quote, or newline, escape double quotes and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = sorted.map((record) => {
    const d = new Date(record.date);
    const dateFormatted = d.toISOString().split('T')[0];
    const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format plates per side breakdown
    const platesEntries = Object.entries(record.platesPerSide || {}).filter(([_, count]) => count > 0);
    const totalPlateCount = platesEntries.reduce((sum, [_, count]) => sum + count * 2, 0);

    const platesPerSideText = platesEntries
      .map(([id, count]) => {
        const plate = ALL_PLATES_MAP.get(id);
        const label = plate ? `${plate.weight}kg (${plate.colorName})` : id;
        return `${count}x ${label}`;
      })
      .join('; ');

    const bwText = record.bodyWeight ? `${record.bodyWeight}` : '';
    const ratioText = record.percentageOfBW ? `${record.percentageOfBW}%` : '';

    return [
      escapeCSV(dateFormatted),
      escapeCSV(timeFormatted),
      escapeCSV(record.lift),
      record.weight,
      record.barWeight,
      escapeCSV(platesPerSideText || 'Unloaded bar'),
      totalPlateCount,
      escapeCSV(bwText),
      escapeCSV(ratioText),
      escapeCSV(record.notes || ''),
    ].join(',');
  });

  // Prepend UTF-8 BOM so Excel and spreadsheet apps open special characters properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date().toISOString().split('T')[0];
  const filename = `barbell-pr-history-${now}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);

  return true;
}
