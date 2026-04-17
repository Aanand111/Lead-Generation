const { pool } = require('../config/db');

const SCALAR_NUMERIC_TYPES = new Set(['int2', 'int4', 'int8', 'numeric', 'float4', 'float8']);
const TEXT_TYPES = new Set(['text', 'varchar', 'bpchar']);
const CACHE_TTL_MS = 60 * 1000;

let cachedColumns = null;
let cachedAt = 0;

const loadLeadPurchaseColumns = async (queryable = pool) => {
    const now = Date.now();

    if (cachedColumns && now - cachedAt < CACHE_TTL_MS) {
        return cachedColumns;
    }

    const result = await queryable.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lead_purchases'
    `);

    cachedColumns = new Map(result.rows.map((row) => [row.column_name, row]));
    cachedAt = now;

    return cachedColumns;
};

const buildNumericColumnExpression = (alias, columns, columnName) => {
    const column = columns.get(columnName);
    if (!column) return null;

    const qualifiedColumn = `${alias}.${columnName}`;

    if (column.data_type === 'ARRAY') {
        return `${qualifiedColumn}[1]`;
    }

    if (SCALAR_NUMERIC_TYPES.has(column.udt_name)) {
        return qualifiedColumn;
    }

    if (TEXT_TYPES.has(column.udt_name)) {
        return `CASE
            WHEN NULLIF(BTRIM(${qualifiedColumn}), '') ~ '^[+-]?[0-9]+([.][0-9]+)?$'
            THEN NULLIF(BTRIM(${qualifiedColumn}), '')::numeric
        END`;
    }

    return null;
};

const buildLeadPurchaseInsert = (columns, leadPriceValue) => {
    const insertColumns = ['user_id', 'lead_id', 'credits_used', 'status'];
    const values = [];

    if (columns.has('lead_price')) {
        const leadPriceColumn = columns.get('lead_price');
        insertColumns.push('lead_price');
        values.push(
            leadPriceColumn.data_type === 'ARRAY'
                ? (leadPriceValue == null ? null : [leadPriceValue])
                : leadPriceValue
        );
    }

    if (columns.has('total_leads')) {
        const totalLeadsColumn = columns.get('total_leads');
        insertColumns.push('total_leads');
        values.push(TEXT_TYPES.has(totalLeadsColumn.udt_name) ? '1' : 1);
    }

    ['remaining_leads', 'remaing_leads', 'remaing_lead'].forEach((columnName) => {
        if (columns.has(columnName)) {
            insertColumns.push(columnName);
            values.push(1);
        }
    });

    if (columns.has('expiry_date')) {
        insertColumns.push('expiry_date');
        values.push(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }

    return { insertColumns, values };
};

module.exports = {
    buildLeadPurchaseInsert,
    buildNumericColumnExpression,
    loadLeadPurchaseColumns,
};
