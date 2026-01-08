import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import path from 'path';

// Mobile-friendly font registration (optional, using standard Helvetica for reliability)

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontSize: 10,
        color: '#1F2937', // Gray-800
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: '2px solid #C02D76', // Primary Accent
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#34394D', // Primary Navy
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280', // Gray-500
        marginTop: 4,
    },
    logo: {
        width: 140,
        height: 'auto',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#C02D76',
        textTransform: 'uppercase',
        marginBottom: 10,
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    col6: {
        width: '50%',
        paddingRight: 10,
    },
    col12: {
        width: '100%',
    },
    label: {
        fontSize: 8,
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 11,
        color: '#111827',
        lineHeight: 1.4,
    },
    valueLarge: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34394D',
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    approvalTable: {
        marginTop: 10,
        border: '1px solid #E5E7EB',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        padding: 8,
        borderBottom: '1px solid #E5E7EB',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottom: '1px solid #F3F4F6',
        alignItems: 'center',
    },
    tableColRole: { width: '35%' },
    tableColName: { width: '30%' },
    tableColDate: { width: '20%' },
    tableColStatus: { width: '15%', alignItems: 'flex-end' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: '1px solid #E5E7EB',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
    }
});

interface ApprovalPdfProps {
    data: {
        id: string
        title: string
        detailedDescription?: string | null
        amount: number
        currency: string
        supplier: string
        category: string
        justification: string
        requester: string
        date: string
        approvals: {
            role: string
            name: string
            date: string
            status: string
        }[]
    }
}

export const ApprovalDocument = ({ data }: ApprovalPdfProps) => {
    // Robust logo path handling for local and Vercel environments
    const footerText = `Request ID: ${data.id} • Generated on ${new Date().toLocaleDateString()}`;
    // In Vercel serverless environment, files in public are kept in root or specific paths.
    // Ideally we pass the buffer or base64, but local filesystem read works if path is correct.
    const logoPath = path.resolve(process.cwd(), 'public/everyday-systems-logo.png');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoPath} style={styles.logo} />
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>Approval Order</Text>
                        <Text style={styles.subtitle}>OFFICIAL AUTHORIZATION DOCUMENT</Text>
                    </View>
                </View>

                {/* Main Details Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Request Details</Text>

                    <View style={styles.row}>
                        <View style={styles.col12}>
                            <Text style={styles.label}>Project / Request Title</Text>
                            <Text style={{ ...styles.value, fontSize: 13, fontWeight: 'bold' }}>{data.title}</Text>
                        </View>
                    </View>

                    <View style={{ ...styles.row, marginTop: 10 }}>
                        <View style={styles.col6}>
                            <Text style={styles.label}>Category</Text>
                            <Text style={styles.value}>{data.category}</Text>
                        </View>
                        <View style={styles.col6}>
                            <Text style={styles.label}>Creation Date</Text>
                            <Text style={styles.value}>{data.date}</Text>
                        </View>
                    </View>

                    <View style={{ ...styles.row, marginTop: 10 }}>
                        <View style={styles.col6}>
                            <Text style={styles.label}>Supplier</Text>
                            <Text style={styles.value}>{data.supplier}</Text>
                        </View>
                        <View style={styles.col6}>
                            <Text style={styles.label}>Total Amount</Text>
                            <Text style={styles.valueLarge}>{data.currency} {data.amount.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Description & Justification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Scope & Justification</Text>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.label}>Business Justification</Text>
                        <Text style={styles.value}>{data.justification}</Text>
                    </View>

                    {data.detailedDescription && (
                        <View>
                            <Text style={styles.label}>Detailed Specifications</Text>
                            <Text style={styles.value}>{data.detailedDescription}</Text>
                        </View>
                    )}
                </View>

                {/* Approval Chain Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authorization Chain</Text>

                    <View style={styles.row}>
                        <View style={styles.col6}>
                            <Text style={styles.label}>Requested By</Text>
                            <Text style={{ ...styles.value, marginBottom: 10 }}>{data.requester}</Text>
                        </View>
                    </View>

                    <View style={styles.approvalTable}>
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.label, ...styles.tableColRole }}>Role</Text>
                            <Text style={{ ...styles.label, ...styles.tableColName }}>Approver</Text>
                            <Text style={{ ...styles.label, ...styles.tableColDate }}>Date</Text>
                            <Text style={{ ...styles.label, ...styles.tableColStatus, textAlign: 'right' }}>Status</Text>
                        </View>

                        {data.approvals.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.tableColRole}>
                                    <Text style={{ ...styles.value, fontSize: 10, fontWeight: 'bold' }}>{item.role}</Text>
                                </View>
                                <View style={styles.tableColName}>
                                    <Text style={{ ...styles.value, fontSize: 10 }}>{item.name || '-'}</Text>
                                </View>
                                <View style={styles.tableColDate}>
                                    <Text style={{ ...styles.value, fontSize: 10 }}>{item.date || '-'}</Text>
                                </View>
                                <View style={styles.tableColStatus}>
                                    <Text style={{
                                        fontSize: 9,
                                        fontWeight: 'bold',
                                        color: item.status === 'APPROVED' ? '#059669' : '#9CA3AF'
                                    }}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#34394D', marginBottom: 4 }}>
                        Everyday Systems (Private) Limited
                    </Text>
                    <Text style={styles.footerText}>
                        {footerText}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
