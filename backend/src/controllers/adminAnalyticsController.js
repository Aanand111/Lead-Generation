const XLSX = require('xlsx');
const adminAnalyticsModel = require('../models/adminAnalyticsModel');

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
        const { format = 'xlsx', type = 'leads' } = req.query;
        let data, worksheetData, sheetName, filename;

        if (type === 'vendors') {
            data = await adminAnalyticsModel.getVendorProductivity();
            worksheetData = data.map(item => ({
                'Vendor Name': item.vendor_name,
                'Phone': item.phone,
                'Leads Uploaded': item.leads_uploaded,
                'Leads Purchased': item.leads_purchased,
                'Conversion Rate (%)': parseFloat(item.conversion_rate).toFixed(2),
                'Negative Reports': item.reports_count || 0
            }));
            sheetName = 'Vendor Productivity';
            filename = `VendorPerformance_${Date.now()}`;
        } else {
            // Default: Leads
            data = await adminAnalyticsModel.getDetailedLeadReports(req.query);
            worksheetData = data.map(item => ({
                'Lead ID': item.lead_id,
                'Customer Name': item.customer_name,
                'City': item.city,
                'State': item.state,
                'Category': item.category,
                'Value (₹)': item.lead_value,
                'Vendor (Uploader)': item.created_by_vendor,
                'Status': item.current_status,
                'Upload Date': new Date(item.upload_date).toLocaleDateString(),
                'Purchase Date': item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'Unsold',
                'Buyer Name': item.buyer_name || 'N/A',
                'Credits Used': item.credits_used || 0
            }));
            sheetName = 'Lead Activity';
            filename = `LeadActivity_${Date.now()}`;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        if (format === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(ws);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            return res.send(csv);
        } else {
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
            return res.send(buf);
        }

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
        const { type } = req.query; // 'view' or 'click'
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
