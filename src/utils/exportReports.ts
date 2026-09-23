import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { ServiceOrder, InventoryPart, MonthlySummary, Employee } from '../types';
import { formatRupiah } from './formatters';

export const exportMonthlyReportToExcel = (
  summary: MonthlySummary,
  services: ServiceOrder[],
  inventory: InventoryPart[],
  employees: Employee[]
) => {
  // Workbook creation
  const wb = XLSX.utils.book_new();

  // 1. Ringkasan Eksekutif
  const executiveData = [
    ['LAPORAN KINERJA & KEUANGAN BENGKEL MOTOR (RAD METODE)'],
    ['Periode:', `${summary.monthName} ${summary.year}`],
    ['Dihasilkan pada:', new Date().toLocaleString('id-ID')],
    ['Bengkel:', 'MotoRAD High-Performance Service & Parts Center'],
    [],
    ['METRIK KUNCI', 'NILAI'],
    ['Total Pendapatan Bengkel', summary.totalRevenue],
    ['Pendapatan Jasa Servis', summary.serviceLaborRevenue],
    ['Penjualan Suku Cadang', summary.partsRevenue],
    ['Estimasi HPP Suku Cadang', summary.partsCost],
    ['Laba Kotor Operasional', summary.grossProfit],
    ['Total Unit Servis Selesai', summary.completedServices],
    ['Kepuasan Pelanggan (CSAT)', `${summary.averageSatisfaction} / 5.0`],
    [],
    ['DISTRIBUSI PEKERJAAN MEKANIK'],
    ['Nama Mekanik', 'Role', 'Status', 'Rating', 'Pekerjaan Diselesaikan'],
    ...employees.map(e => [e.name, e.role, e.status, e.rating, e.completedJobs])
  ];

  const wsExec = XLSX.utils.aoa_to_sheet(executiveData);
  XLSX.utils.book_append_sheet(wb, wsExec, 'Ringkasan Eksekutif');

  // 2. Data Transaksi Servis
  const serviceHeaders = [
    'No. Order',
    'Waktu Masuk',
    'Nama Pelanggan',
    'No. Handphone',
    'Model Motor',
    'No. Polisi',
    'Kategori Servis',
    'Keluhan & Masalah',
    'Bay',
    'Mekanik Penanggung Jawab',
    'Status Pengerjaan',
    'Biaya Jasa (Rp)',
    'Biaya Suku Cadang (Rp)',
    'Total Biaya (Rp)'
  ];

  const serviceRows = services.map(s => {
    const partsCost = s.partsUsed.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    return [
      s.orderNumber,
      s.createdAt,
      s.customerName,
      s.customerPhone,
      s.motorModel,
      s.plateNumber,
      s.serviceCategory,
      s.complaints,
      `Bay ${s.bayNumber}`,
      s.mechanicName,
      s.status,
      s.laborCost,
      partsCost,
      s.totalCost
    ];
  });

  const wsServices = XLSX.utils.aoa_to_sheet([serviceHeaders, ...serviceRows]);
  XLSX.utils.book_append_sheet(wb, wsServices, 'Daftar Servis');

  // 3. Data Inventaris Suku Cadang
  const inventoryHeaders = [
    'SKU',
    'Nama Suku Cadang',
    'Kategori',
    'Stok Fisik',
    'Batas Minimum',
    'Satuan',
    'Status Stok',
    'Harga Beli / HPP (Rp)',
    'Harga Jual (Rp)',
    'Total Nilai Aset (Rp)',
    'Lokasi Rak Penempatan',
    'Kompatibilitas Motor'
  ];

  const inventoryRows = inventory.map(p => {
    const status = p.stock === 0 ? 'HABIS' : p.stock <= p.minStock ? 'MENIPIS' : 'AMAN';
    return [
      p.sku,
      p.name,
      p.category,
      p.stock,
      p.minStock,
      p.unit,
      status,
      p.buyPrice,
      p.sellPrice,
      p.stock * p.sellPrice,
      p.shelfLocation,
      p.compatibleMotors.join(', ')
    ];
  });

  const wsInventory = XLSX.utils.aoa_to_sheet([inventoryHeaders, ...inventoryRows]);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Stok Suku Cadang');

  // Generate file & trigger download
  const filename = `Laporan_Bengkel_MotoRAD_${summary.monthName}_${summary.year}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportMonthlyReportToPDF = (
  summary: MonthlySummary,
  services: ServiceOrder[],
  inventory: InventoryPart[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header Bengkel (Header Box)
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(14, currentY, pageWidth - 28, 26, 'F');

  doc.setTextColor(56, 189, 248); // neon cyan
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTORAD SERVICE & SPARE PARTS CENTER', 20, currentY + 9);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Operasional Bengkel Motor Modern Berbasis Rapid Application Development (RAD)', 20, currentY + 16);
  doc.text(`Laporan Resmi Periode: ${summary.monthName} ${summary.year} | Cetak: ${new Date().toLocaleDateString('id-ID')}`, 20, currentY + 22);

  currentY += 34;

  // Ringkasan Keuangan Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RINGKASAN FINANSIAL & OPERASIONAL BULANAN', 14, currentY);

  currentY += 6;

  // Metric grid
  const metrics = [
    { label: 'Total Omset Bengkel', val: formatRupiah(summary.totalRevenue) },
    { label: 'Pendapatan Servis', val: formatRupiah(summary.serviceLaborRevenue) },
    { label: 'Penjualan Spare Part', val: formatRupiah(summary.partsRevenue) },
    { label: 'Estimasi Laba Kotor', val: formatRupiah(summary.grossProfit) },
    { label: 'Unit Motor Selesai', val: `${summary.completedServices} Kendaraan` },
    { label: 'Skor Kepuasan Konsumen', val: `${summary.averageSatisfaction} / 5.00 ⭐` }
  ];

  doc.setFontSize(9);
  const colWidth = (pageWidth - 28) / 2;
  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 14 + (col * colWidth);
    const y = currentY + (row * 12);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, colWidth - 4, 10, 1.5, 1.5, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(m.label, x + 4, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(m.val, x + 4, y + 8.5);
  });

  currentY += 42;

  // 2. Status Stok Kritis
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. STATUS SUKU CADANG MENIPIS (PERLU RESTOCK CEPAT)', 14, currentY);

  currentY += 6;

  // Header Table
  doc.setFillColor(30, 41, 59);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SKU', 18, currentY + 5);
  doc.text('Nama Komponen', 46, currentY + 5);
  doc.text('Kategori', 105, currentY + 5);
  doc.text('Sisa Stok', 140, currentY + 5);
  doc.text('Ambang Min.', 165, currentY + 5);

  currentY += 7;

  const lowParts = inventory.filter(p => p.stock <= p.minStock).slice(0, 6);
  if (lowParts.length === 0) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'italic');
    doc.text('Semua stok suku cadang dalam kondisi aman di atas batas minimum.', 18, currentY + 6);
    currentY += 10;
  } else {
    lowParts.forEach((part, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(part.sku, 18, currentY + 5);
      doc.text(part.name.substring(0, 32), 46, currentY + 5);
      doc.text(part.category, 105, currentY + 5);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text(`${part.stock} ${part.unit}`, 140, currentY + 5);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(`${part.minStock} ${part.unit}`, 165, currentY + 5);
      currentY += 7;
    });
  }

  currentY += 8;

  // 3. Sampel Servis Terbaru
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. AKTIVITAS & PENJADWALAN SERVIS TERAKHIR', 14, currentY);

  currentY += 6;

  doc.setFillColor(30, 41, 59);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('No. Order', 18, currentY + 5);
  doc.text('Kendaraan & Plat', 46, currentY + 5);
  doc.text('Kategori Servis', 105, currentY + 5);
  doc.text('Mekanik', 145, currentY + 5);
  doc.text('Total (Rp)', 175, currentY + 5);

  currentY += 7;

  services.slice(0, 5).forEach((srv, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248);
    doc.rect(14, currentY, pageWidth - 28, 7, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(srv.orderNumber, 18, currentY + 5);
    doc.text(`${srv.motorModel.substring(0, 20)} (${srv.plateNumber})`, 46, currentY + 5);
    doc.text(srv.serviceCategory, 105, currentY + 5);
    doc.text(srv.mechanicName.split(' ')[0], 145, currentY + 5);
    doc.text(formatRupiah(srv.totalCost), 175, currentY + 5);
    currentY += 7;
  });

  currentY += 12;

  // Signature Block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Disetujui Oleh,', 140, currentY);
  doc.text('Kepala Operasional Bengkel', 140, currentY + 5);

  currentY += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('( Nurul Arif, S.T. )', 140, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Super Admin / Lead Systems Architect', 140, currentY + 4);

  // Footer note
  doc.setFontSize(7);
  doc.text('Dokumen ini digenerate secara otomatis oleh sistem terintegrasi MotoRAD (Rapid Application Development Model).', 14, 285);

  doc.save(`Laporan_Bulanan_Bengkel_MotoRAD_${summary.monthName}_${summary.year}.pdf`);
};

export const exportServiceInvoiceToPDF = (service: ServiceOrder) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 12;

  // Header Box
  doc.setFillColor(15, 23, 42);
  doc.rect(10, currentY, pageWidth - 20, 22, 'F');
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTORAD WORKSHOP', 15, currentY + 8);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('FAKTUR RESMI LAYANAN SERVIS & SUKU CADANG MOTOR', 15, currentY + 14);
  doc.text(`No. Faktur: ${service.orderNumber} | Tanggal: ${service.createdAt}`, 15, currentY + 19);

  currentY += 28;

  // Customer & Bike Info Box
  doc.setFillColor(248, 250, 252);
  doc.rect(10, currentY, pageWidth - 20, 24, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pelanggan: ${service.customerName}`, 14, currentY + 6);
  doc.text(`No. HP: ${service.customerPhone}`, 14, currentY + 11);
  doc.text(`Kendaraan: ${service.motorModel}`, 14, currentY + 16);
  doc.text(`No. Polisi: ${service.plateNumber}`, 14, currentY + 21);

  doc.text(`Mekanik: ${service.mechanicName}`, 80, currentY + 6);
  doc.text(`Bay Pengerjaan: Bay ${service.bayNumber}`, 80, currentY + 11);
  doc.text(`Status: ${service.status}`, 80, currentY + 16);

  currentY += 29;

  // Table items
  doc.setFillColor(30, 41, 59);
  doc.rect(10, currentY, pageWidth - 20, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Item / Uraian Pekerjaan & Suku Cadang', 14, currentY + 4);
  doc.text('Qty', 85, currentY + 4);
  doc.text('Harga (Rp)', 100, currentY + 4);
  doc.text('Subtotal (Rp)', 125, currentY + 4);

  currentY += 6;

  // Labor Row
  doc.setFillColor(255, 255, 255);
  doc.rect(10, currentY, pageWidth - 20, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Jasa Servis: ${service.serviceCategory}`, 14, currentY + 4.5);
  doc.text('1', 87, currentY + 4.5);
  doc.text(formatRupiah(service.laborCost), 100, currentY + 4.5);
  doc.text(formatRupiah(service.laborCost), 125, currentY + 4.5);
  currentY += 6;

  // Parts Rows
  service.partsUsed.forEach((part, i) => {
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
    doc.rect(10, currentY, pageWidth - 20, 6, 'F');
    doc.text(part.name.substring(0, 34), 14, currentY + 4.5);
    doc.text(String(part.quantity), 87, currentY + 4.5);
    doc.text(formatRupiah(part.price), 100, currentY + 4.5);
    doc.text(formatRupiah(part.price * part.quantity), 125, currentY + 4.5);
    currentY += 6;
  });

  currentY += 4;

  // Total Summary
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(80, currentY, pageWidth - 90, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PEMBAYARAN:', 84, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(14, 116, 144);
  doc.text(formatRupiah(service.totalCost), 84, currentY + 12);

  currentY += 24;

  // Warranty Note & Signature
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('* Garansi servis berlaku 7 hari atau 500 km sejak tanggal pengerjaan.', 10, currentY);
  doc.text('* Suku cadang original dijamin keasliannya oleh MotoRAD Center.', 10, currentY + 4);

  doc.setTextColor(15, 23, 42);
  doc.text('Tanda Terima Pelanggan,', 15, currentY + 14);
  doc.text('Kasir Bengkel,', 105, currentY + 14);

  currentY += 24;
  doc.text(`( ${service.customerName} )`, 15, currentY);
  doc.text('( Rina Safitri )', 105, currentY);

  doc.save(`Faktur_Servis_${service.orderNumber}.pdf`);
};
