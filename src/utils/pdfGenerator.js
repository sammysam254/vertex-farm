import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUSD, formatDatePretty } from './dateUtils';

/**
 * Generate Comprehensive Fleet Summary PDF
 */
export function generateFarmSummaryPDF({
  weekCycle,
  devices,
  withdrawals,
  payments,
  totalIncome,
  totalPaid,
  netProfit,
  adminEmail = 'Authorized Master Administrator'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Branding
  doc.setFillColor(10, 15, 29); // Dark obsidian header background
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(56, 189, 248); // Cyan
  doc.rect(0, 42, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('VERTEX FARM - SURVEY FLEET', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Multi-Device Android Operations & Weekly Revenue Ledger', 14, 25);
  doc.text('Master Authorization: Certified Fleet Settlement', 14, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248);
  doc.text(`Week: ${weekCycle.label}`, pageWidth - 14, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Cutoff: Saturday 23:59 (Payday Sunday)`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 34, { align: 'right' });

  // 3 POOLS SUMMARY METRIC CARDS
  let startY = 52;
  const cardWidth = 56;
  const cardHeight = 24;

  // Card 1: Total Income Pool
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, startY, cardWidth, cardHeight, 3, 3, 'D');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL INCOME POOL', 18, startY + 7);
  doc.setFontSize(14);
  doc.setTextColor(2, 132, 199);
  doc.text(formatUSD(totalIncome), 18, startY + 17);

  // Card 2: Total Paid to Workers
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(76, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.roundedRect(76, startY, cardWidth, cardHeight, 3, 3, 'D');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PAID (WORKERS)', 80, startY + 7);
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text(formatUSD(totalPaid), 80, startY + 17);

  // Card 3: Net Profit
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(138, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.roundedRect(138, startY, cardWidth, cardHeight, 3, 3, 'D');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('NET ADMIN PROFIT', 142, startY + 7);
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(formatUSD(netProfit), 142, startY + 17);

  // TABLE 1: DEVICE & WORKER PERFORMANCE
  startY = 84;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Fleet Devices & $40 Weekly Quotas', 14, startY);

  const deviceRows = devices.map(device => {
    const devWithdrawals = withdrawals.filter(w => w.device_serial === device.serial_number || w.device_id === device.id);
    const devPayments = payments.filter(p => p.device_serial === device.serial_number || p.device_id === device.id);

    const earned = devWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
    const paid = devPayments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0);
    const remainingBalance = earned - paid;
    const target = Number(device.weekly_target_usd || 40);

    const hitQuota = remainingBalance >= target;
    const workerEligible = Math.max(0, remainingBalance - target);
    const statusText = hitQuota ? 'TARGET MET ($40+ Net)' : `IN PROGRESS (${formatUSD(remainingBalance)} / $40)`;

    return [
      device.serial_number,
      device.worker_name,
      device.worker_phone || 'None',
      formatUSD(target),
      formatUSD(earned),
      formatUSD(paid),
      formatUSD(remainingBalance),
      statusText
    ];
  });

  autoTable(doc, {
    startY: startY + 4,
    head: [['Serial No.', 'Worker', 'Phone', 'Owner Target', 'Earned', 'Paid', 'Remaining Net', 'Target Status']],
    body: deviceRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { fontStyle: 'bold', textColor: [2, 132, 199] },
      5: { textColor: [245, 158, 11] },
      6: { fontStyle: 'bold', textColor: [16, 185, 129] },
      7: { fontStyle: 'bold' }
    }
  });

  // TABLE 2: RECENT TRANSACTIONS STREAM
  let finalY = doc.lastAutoTable.finalY + 12;
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Itemized Withdrawals & Worker Payments', 14, finalY);

  const allTx = [
    ...withdrawals.map(w => ({
      date: w.withdrawal_date,
      type: 'WITHDRAWAL (INCOME)',
      serial: w.device_serial,
      worker: w.worker_name,
      platform: w.platform || 'Surveys',
      amount: w.amount_usd,
      isIncome: true
    })),
    ...payments.map(p => ({
      date: p.payment_date,
      type: 'PAID TO WORKER',
      serial: p.device_serial,
      worker: p.worker_name,
      platform: p.payment_method || 'Payout',
      amount: p.amount_usd,
      isIncome: false
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const txRows = allTx.map(tx => [
    formatDatePretty(tx.date),
    tx.type,
    tx.serial,
    tx.worker,
    tx.platform,
    tx.isIncome ? `+${formatUSD(tx.amount)}` : `-${formatUSD(tx.amount)}`
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Date', 'Transaction Type', 'Serial', 'Worker', 'Platform / Note', 'Amount']],
    body: txRows.length ? txRows : [['No transactions recorded for this period', '', '', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2
    }
  });

  // Footer & Signature
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vertex Farm Ledger • Official Fleet Statement • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`VertexFarm_Fleet_Report_${weekCycle.id}.pdf`);
}

/**
 * Generate Individual Worker Statement PDF
 */
export function generateWorkerStatementPDF({
  workerName,
  deviceSerial,
  workerPhone,
  weekCycle,
  withdrawals,
  payments,
  adminEmail = 'Authorized Master Administrator'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 42, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('WORKER WEEKLY SETTLEMENT STATEMENT', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Vertex Farm Survey Operations • Weekly $40 Owner Quota Settlement', 14, 25);
  doc.text('Authorized Settlement & Verification: Approved', 14, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248);
  doc.text(`Week: ${weekCycle.label}`, pageWidth - 14, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Deadline: Saturday 23:59 • Payday: Sunday`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 34, { align: 'right' });

  // Worker Info Box
  let startY = 52;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, pageWidth - 28, 24, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, startY, pageWidth - 28, 24, 3, 3, 'D');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('WORKER NAME', 20, startY + 8);
  doc.text('DEVICE SERIAL', 75, startY + 8);
  doc.text('PHONE NUMBER', 135, startY + 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(workerName, 20, startY + 17);
  doc.text(deviceSerial, 75, startY + 17);
  doc.text(workerPhone || 'N/A (Optional)', 135, startY + 17);

  // Financial Breakdown calculations: remaining balance after paid deductions
  const totalEarned = withdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0);
  const remainingBalance = totalEarned - totalPaid;
  const ownerTarget = 40.00;
  const ownerCut = Math.min(remainingBalance, ownerTarget);
  const netDueToWorker = Math.max(0, remainingBalance - ownerTarget);
  const targetAchieved = remainingBalance >= ownerTarget;

  // Breakdown Summary Boxes
  startY = 84;
  const colW = (pageWidth - 28 - 9) / 4;

  // Box 1: Total Withdrawn
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, colW, 24, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL WITHDRAWN', 18, startY + 7);
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text(formatUSD(totalEarned), 18, startY + 17);

  // Box 2: Owner Cut ($40)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14 + colW + 3, startY, colW, 24, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('OWNER TARGET ($40)', 18 + colW + 3, startY + 7);
  doc.setFontSize(12);
  doc.setTextColor(totalEarned >= ownerTarget ? 16 : 244, totalEarned >= ownerTarget ? 185 : 63, totalEarned >= ownerTarget ? 129 : 94);
  doc.text(`${formatUSD(ownerCut)} / $40`, 18 + colW + 3, startY + 17);

  // Box 3: Advances / Paid
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14 + (colW + 3) * 2, startY, colW, 24, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ADVANCES / PAID', 18 + (colW + 3) * 2, startY + 7);
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 11);
  doc.text(formatUSD(totalPaid), 18 + (colW + 3) * 2, startY + 17);

  // Box 4: Net Worker Due
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14 + (colW + 3) * 3, startY, colW, 24, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NET SUNDAY PAYOUT', 18 + (colW + 3) * 3, startY + 7);
  doc.setFontSize(12);
  doc.setTextColor(netDueToWorker >= 0 ? 16 : 244, netDueToWorker >= 0 ? 185 : 63, netDueToWorker >= 0 ? 129 : 94);
  doc.text(formatUSD(netDueToWorker), 18 + (colW + 3) * 3, startY + 17);

  // Target Status banner
  startY = 114;
  doc.setFillColor(targetAchieved ? 240 : 255, targetAchieved ? 253 : 241, targetAchieved ? 244 : 242);
  doc.roundedRect(14, startY, pageWidth - 28, 14, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(targetAchieved ? 22 : 185, targetAchieved ? 101 : 28, targetAchieved ? 52 : 28);
  const statusMsg = targetAchieved
    ? `TARGET STATUS: Owner $40 USD quota satisfied for this week after paid deductions! Remaining surplus is allocated to ${workerName}.`
    : `TARGET STATUS: Quota Incomplete! ${formatUSD(40 - remainingBalance)} remaining after paid deductions to reach the $40 owner target before Saturday 23:59.`;
  doc.text(statusMsg, 18, startY + 9);

  // Itemized Activity Table
  startY = 135;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Itemized Device Activity & Deductions', 14, startY);

  const txItems = [
    ...withdrawals.map(w => ({
      date: w.withdrawal_date,
      type: 'Survey Withdrawal (Income)',
      details: w.platform || 'Surveys',
      notes: w.notes || '-',
      amount: `+${formatUSD(w.amount_usd)}`,
      isAdd: true
    })),
    ...payments.map(p => ({
      date: p.payment_date,
      type: 'Paid to Worker (Advance / Deduction)',
      details: p.payment_method || 'Payout',
      notes: p.notes || '-',
      amount: `-${formatUSD(p.amount_usd)}`,
      isAdd: false
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  autoTable(doc, {
    startY: startY + 4,
    head: [['Date', 'Transaction Type', 'Platform / Method', 'Notes', 'Amount (USD)']],
    body: txItems.length ? txItems.map(t => [formatDatePretty(t.date), t.type, t.details, t.notes, t.amount]) : [['No transactions recorded for this device', '', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 16;
  if (finalY < 260) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Worker Signature: _______________________      Admin Signature: _______________________', 14, finalY);
  }

  doc.save(`Statement_${workerName.replace(/\s+/g, '_')}_${weekCycle.id}.pdf`);
}
