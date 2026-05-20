const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class InvoiceService {
    /**
     * generateSubscriptionInvoice
     * @param {Object} data - { user, plan, transactionId, date }
     * @returns {Promise<string>} - Path to the generated PDF
     */
    async generateSubscriptionInvoice(data) {
        return new Promise((resolve, reject) => {
            try {
                const { user, plan, transactionId, date } = data;
                const fileName = `invoice_${transactionId}.pdf`;
                const invoicesDir = path.join(__dirname, '../../temp/invoices');
                
                // Ensure directory exists
                if (!fs.existsSync(invoicesDir)) {
                    fs.mkdirSync(invoicesDir, { recursive: true });
                }

                const filePath = path.join(invoicesDir, fileName);
                const doc = new PDFDocument({ margin: 50 });

                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                // --- Header / Logo ---
                // Note: If you have a physical logo file, uncomment below
                // doc.image('path/to/logo.png', 50, 45, { width: 50 });
                doc.fillColor('#444444')
                   .fontSize(20)
                   .text('LEADGEN NETWORK', 50, 50, { align: 'right' })
                   .fontSize(10)
                   .text('Premium Lead Generation Platform', 50, 75, { align: 'right' })
                   .moveDown();

                // --- Invoice Title ---
                doc.fillColor('#6366f1')
                   .fontSize(25)
                   .text('INVOICE', 50, 150);

                doc.strokeColor('#eeeeee')
                   .lineWidth(1)
                   .moveTo(50, 185)
                   .lineTo(550, 185)
                   .stroke();

                // --- Details Row ---
                doc.fillColor('#444444')
                   .fontSize(10)
                   .text(`Invoice Number: INV-${transactionId.slice(-6).toUpperCase()}`, 50, 200)
                   .text(`Date: ${new Date(date).toLocaleDateString()}`, 50, 215)
                   .text(`Transaction ID: ${transactionId}`, 50, 230)
                   .moveDown();

                // --- Bill To ---
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .text('Bill To:', 50, 260)
                   .font('Helvetica')
                   .fontSize(10)
                   .text(user.name || 'Valued Customer', 50, 280)
                   .text(user.email || '', 50, 295)
                   .text(user.phone || '', 50, 310);

                // --- Table Header ---
                const tableTop = 360;
                doc.font('Helvetica-Bold')
                   .fontSize(10);
                
                doc.text('Subscription Description', 50, tableTop);
                doc.text('Credits', 300, tableTop, { width: 90, align: 'right' });
                doc.text('Validity', 400, tableTop, { width: 90, align: 'right' });
                doc.text('Price', 480, tableTop, { width: 70, align: 'right' });

                doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

                // --- Table Content ---
                const itemY = tableTop + 30;
                doc.font('Helvetica')
                   .text(plan.name, 50, itemY)
                   .text(`${plan.credits || 0} Leads`, 300, itemY, { width: 90, align: 'right' })
                   .text(`${plan.duration || 0} Days`, 400, itemY, { width: 90, align: 'right' })
                   .text(`INR ${plan.price}`, 480, itemY, { width: 70, align: 'right' });

                // --- Summary ---
                const summaryY = itemY + 50;
                doc.strokeColor('#eeeeee').moveTo(350, summaryY).lineTo(550, summaryY).stroke();

                doc.font('Helvetica-Bold')
                   .text('Total Amount Paid:', 350, summaryY + 15)
                   .fontSize(14)
                   .fillColor('#6366f1')
                   .text(`INR ${plan.price}`, 480, summaryY + 12, { width: 70, align: 'right' });

                // --- Footer ---
                const footerY = 700;
                doc.fillColor('#aaaaaa')
                   .fontSize(8)
                   .text('This is a computer generated invoice and does not require a signature.', 50, footerY, { align: 'center' })
                   .text('Thank you for choosing LeadGen Network Protocol.', 50, footerY + 15, { align: 'center' });

                doc.end();

                writeStream.on('finish', () => {
                    logger.info(`[INVOICE] PDF generated at ${filePath}`);
                    resolve(filePath);
                });

                writeStream.on('error', (err) => {
                    reject(err);
                });

            } catch (err) {
                logger.error('[INVOICE ERROR]', err);
                reject(err);
            }
        });
    }
}

module.exports = new InvoiceService();
