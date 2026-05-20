const XLSX = require('xlsx');
const adminAnalyticsModel = require('../models/adminAnalyticsModel');
const { parseNumber } = require('../config/env');

const MAX_XLSX_EXPORT_ROWS = parseNumber(process.env.MAX_XLSX_EXPORT_ROWS, 5000);
const CSV_EXPORT_BATCH_SIZE = parseNumber(process.env.CSV_EXPORT_BATCH_SIZE, 1000);

const LEAD_EXPORT_HEADERS = [
    'Lead ID',
    'Customer Name',
    'City',
    'State',
    'Category',
    'Value (INR)',
    'Vendor (Uploader)',
    'Status',
    'Upload Date',
    'Purchase Date',
    'Buyer Name',
    'Credits Used'
];

const VENDOR_EXPORT_HEADERS = [
    'Vendor Name',
    'Phone',
    'Leads Uploaded',
    'Leads Purchased',
    'Conversion Rate (%)',
    'Negative Reports'
];

const csvEscape = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');

const mapLeadExportRow = (item) => ({
    'Lead ID': item.lead_id,
    'Customer Name': item.customer_name,
    'City': item.city,
    'State': item.state,
    'Category': item.category,
    'Value (INR)': item.lead_value,
    'Vendor (Uploader)': item.created_by_vendor,
    'Status': item.current_status,
    'Upload Date': formatDate(item.upload_date),
    'Purchase Date': item.purchase_date ? formatDate(item.purchase_date) : 'Unsold',
    'Buyer Name': item.buyer_name || 'N/A',
    'Credits Used': item.credits_used || 0
});

const mapVendorExportRow = (item) => ({
    'Vendor Name': item.vendor_name,
    'Phone': item.phone,
    'Leads Uploaded': item.leads_uploaded,
    'Leads Purchased': item.leads_purchased,
    'Conversion Rate (%)': parseFloat(item.conversion_rate).toFixed(2),
    'Negative Reports': item.reports_count || 0
});

const writeCsvHeader = (res, headers) => {
    res.write(`${headers.join(',')}\n`);
};

const writeCsvRows = (res, rows, headers) => {
    for (const row of rows) {
        const line = headers.map((header) => csvEscape(row[header])).join(',');
        res.write(`${line}\n`);
    }
};

const buildExportFilename = (type) => (
    type === 'vendors'
        ? `VendorPerformance_${Date.now()}`
        : `LeadActivity_${Date.now()}`
);

const sendOversizedXlsxResponse = (res, type, totalRows) => {
    const label = type === 'vendors' ? 'vendor' : 'lead';
    return res.status(413).json({
        success: false,
        message: `XLSX export is limited to ${MAX_XLSX_EXPORT_ROWS} rows. Current ${label} export matches ${totalRows} rows. Use CSV export or apply tighter filters.`
    });
};

const streamLeadCsv = async (res, filters) => {
    let cursorCreatedAt = null;
    let cursorId = null;

    while (true) {
        const batch = await adminAnalyticsModel.getDetailedLeadReportBatch(filters, {
            limit: CSV_EXPORT_BATCH_SIZE,
            cursorCreatedAt,
            cursorId
        });

        if (batch.length === 0) {
            break;
        }

        writeCsvRows(res, batch.map(mapLeadExportRow), LEAD_EXPORT_HEADERS);

        const lastRow = batch[batch.length - 1];
        cursorCreatedAt = lastRow.upload_date;
        cursorId = lastRow._cursor_id;
    }
};

const streamVendorCsv = async (res) => {
    let offset = 0;

    while (true) {
        const batch = await adminAnalyticsModel.getVendorProductivity({
            limit: CSV_EXPORT_BATCH_SIZE,
            offset
        });

        if (batch.length === 0) {
            break;
        }

        writeCsvRows(res, batch.map(mapVendorExportRow), VENDOR_EXPORT_HEADERS);
        offset += batch.length;
    }
};

const fetchGranularAnalytics = async (req, res, next) => {
    try {
        const [
            vendorProductivity,
            feedbackTrends,
            bannerPerformance,
            subscriptionStats,
            leadLifecycle,
            vendorTrends
        ] = await Promise.all([
            adminAnalyticsModel.getVendorProductivity(),
            adminAnalyticsModel.getFeedbackTrends(),
            adminAnalyticsModel.getBannerPerformance(),
            adminAnalyticsModel.getSubscriptionAnalytics(),
            adminAnalyticsModel.getLeadLifecycleAnalytics(),
            adminAnalyticsModel.getVendorPerformanceTrends()
        ]);

        res.status(200).json({
            success: true,
            data: {
                vendorProductivity,
                feedbackTrends,
                bannerPerformance,
                subscriptionStats,
                leadLifecycle,
                vendorTrends
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLeadReports = async (req, res, next) => {
    try {
        const reports = await adminAnalyticsModel.getDetailedLeadReports(req.query);
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        next(err);
    }
};

const exportDetailedReports = async (req, res, next) => {
    try {
        const requestedFormat = String(req.query.format || 'xlsx').toLowerCase();
        const format = requestedFormat === 'csv' ? 'csv' : 'xlsx';
        const type = req.query.type === 'vendors' ? 'vendors' : 'leads';
        const filename = buildExportFilename(type);

        if (format === 'xlsx') {
            if (type === 'vendors') {
                const totalRows = await adminAnalyticsModel.countVendorProductivity();
                if (totalRows > MAX_XLSX_EXPORT_ROWS) {
                    return sendOversizedXlsxResponse(res, type, totalRows);
                }

                const data = await adminAnalyticsModel.getVendorProductivity({ limit: MAX_XLSX_EXPORT_ROWS });
                const worksheetData = data.map(mapVendorExportRow);
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(worksheetData);
                XLSX.utils.book_append_sheet(wb, ws, 'Vendor Productivity');
                const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
                return res.send(buf);
            }

            const totalRows = await adminAnalyticsModel.countDetailedLeadReports(req.query);
            if (totalRows > MAX_XLSX_EXPORT_ROWS) {
                return sendOversizedXlsxResponse(res, type, totalRows);
            }

            const data = await adminAnalyticsModel.getDetailedLeadReports({
                ...req.query,
                limit: MAX_XLSX_EXPORT_ROWS
            });
            const worksheetData = data.map(mapLeadExportRow);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(wb, ws, 'Lead Activity');
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
            return res.send(buf);
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);

        if (type === 'vendors') {
            writeCsvHeader(res, VENDOR_EXPORT_HEADERS);
            await streamVendorCsv(res);
            return res.end();
        }

        writeCsvHeader(res, LEAD_EXPORT_HEADERS);
        await streamLeadCsv(res, req.query);
        return res.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint for recording impressions and clicks for Banner Analytics.
 */
const recordBannerInteraction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const { pool } = require('../config/db');

        if (type === 'click') {
            await pool.query('UPDATE banners SET clicks = clicks + 1 WHERE id = $1', [id]);
        } else {
            await pool.query('UPDATE banners SET views = views + 1 WHERE id = $1', [id]);
        }

        res.status(200).json({ success: true, message: 'Interaction recorded.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchGranularAnalytics,
    getLeadReports,
    exportDetailedReports,
    recordBannerInteraction
};
