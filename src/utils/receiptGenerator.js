import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF receipt for a payment.
 * @param {Object} data - The payment data.
 */
export const generateReceipt = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header Section ---
    doc.setFillColor(245, 158, 11); // Primary color (Orange/Amber)
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RC ACADEMY', 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Kundrathur Main Rd, Mangadu, Chennai, Tamil Nadu 600122', 15, 32);

    // Receipt Number and Date on the right - Adjusted for no overlap
    doc.setFontSize(9);
    doc.text(`Receipt #: ${data.receiptNumber || 'N/A'}`, pageWidth - 15, 20, { align: 'right' });
    doc.text(`Date: ${new Date(data.paymentDate || Date.now()).toLocaleDateString()}`, pageWidth - 15, 27, { align: 'right' });

    // --- Student Details Section ---
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT FOR:', 15, 60);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${data.studentName || data.name || (data.studentId && data.studentId.name) || 'N/A'}`, 15, 70);
    doc.text(`Register Number: ${data.registerNumber || (data.studentId && data.studentId.registerNumber) || 'N/A'}`, 15, 78);
    if (data.batch) doc.text(`Batch: ${data.batch}`, 15, 86);

    // --- Payment Details Table ---
    const tableHeaders = [['Description', 'Fee Type', 'Protocol', 'Amount']];
    const tableData = [
        [
            data.term || 'Monthly Tuition Fee',
            (data.feeType || 'tuition').toUpperCase(),
            (data.paymentMode || 'cash').toUpperCase(),
            `INR ${parseFloat(data.amount || data.totalPaid || 0).toLocaleString()}`
        ]
    ];

    autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 100,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            3: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // --- Summary Section ---
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.line(15, finalY, pageWidth - 15, finalY);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('TOTAL AMOUNT PAID', 15, finalY + 15);

    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11); // Branded orange
    const amount = `INR ${parseFloat(data.amount || data.totalPaid || 0).toLocaleString()}`;
    doc.text(amount, pageWidth - 15, finalY + 15, { align: 'right' });

    // --- Footer ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated receipt and does not require a physical signature.', pageWidth / 2, 280, { align: 'center' });
    doc.text('Thank you for your payment.', pageWidth / 2, 285, { align: 'center' });

    // Save the PDF
    const filename = `Receipt_${data.receiptNumber || 'Record'}_${Date.now()}.pdf`;
    doc.save(filename);
};
