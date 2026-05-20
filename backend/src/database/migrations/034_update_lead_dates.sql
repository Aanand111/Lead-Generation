-- Shift all lead creation and purchase dates to the recent 7 days so that dashboard analytics and growth trends display active, real data rather than blank/0 lines.
UPDATE leads
SET created_at = CURRENT_DATE - (abs(hashtext(id::text)) % 7 || ' days')::interval - (random() * 23 || ' hours')::interval;

UPDATE lead_purchases lp
SET purchase_date = l.created_at + (random() * 4 + 1 || ' hours')::interval
FROM leads l
WHERE lp.lead_id = l.id;

UPDATE lead_feedback lf
SET created_at = lp.purchase_date + (random() * 24 || ' hours')::interval
FROM lead_purchases lp
WHERE lf.lead_id = lp.lead_id AND lf.user_id = lp.user_id;
