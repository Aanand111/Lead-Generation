import React, { useState } from 'react';
import { Download, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const FbLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);

    return (
        <div style={{ paddingBottom: '30px', color: 'var(--text-dark)' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 5px 0' }}>Facebook Leads</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        Leads captured from Facebook Lead Ads (most recent first).
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        backgroundColor: 'transparent',
                        color: 'var(--primary, #556ee6)',
                        border: '1px solid var(--border-color)',
                        padding: '6px 12px', borderRadius: '4px',
                        fontSize: '13px', cursor: 'pointer', fontWeight: '500'
                    }}>
                        <Download size={14} /> Export CSV
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        backgroundColor: 'var(--primary, #556ee6)',
                        color: '#ffffff', border: 'none',
                        padding: '6px 12px', borderRadius: '4px',
                        fontSize: '13px', cursor: 'pointer', fontWeight: '500'
                    }}>
                        <Plus size={14} /> Add Lead
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="card" style={{ backgroundColor: 'var(--surface-color)', padding: 0, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto', marginBottom: '20px' }}>
                <table className="table" style={{ margin: 0, borderCollapse: 'collapse', width: '100%', minWidth: '1000px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>#</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Lead ID</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Form ID</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Phone</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Raw Payload</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Created</th>
                            <th style={{ padding: '15px', fontWeight: '600', color: 'var(--text-dark)', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : leads.length === 0 ? (
                            <tr style={{ backgroundColor: 'var(--bg-color)' }}>
                                <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No Facebook leads found.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '15px' }}>{index + 1}</td>
                                    <td style={{ padding: '15px' }}>{lead.lead_id}</td>
                                    <td style={{ padding: '15px' }}>{lead.form_id}</td>
                                    <td style={{ padding: '15px' }}>{lead.name}</td>
                                    <td style={{ padding: '15px' }}>{lead.email}</td>
                                    <td style={{ padding: '15px' }}>{lead.phone}</td>
                                    <td style={{ padding: '15px' }}>-</td>
                                    <td style={{ padding: '15px' }}>{lead.created_at}</td>
                                    <td style={{ padding: '15px' }}>-</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div>
                    Showing page 1 of 1
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px', backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)', borderRadius: '4px',
                        cursor: 'not-allowed', color: 'var(--text-muted)', opacity: 0.6
                    }} disabled>
                        <ChevronsLeft size={14} />
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px', backgroundColor: 'var(--primary, #556ee6)',
                        border: 'none', borderRadius: '4px',
                        cursor: 'pointer', color: '#fff', fontWeight: '500'
                    }}>
                        1
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px', backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)', borderRadius: '4px',
                        cursor: 'not-allowed', color: 'var(--text-muted)', opacity: 0.6
                    }} disabled>
                        <ChevronsRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FbLeads;
