import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Register a nice font (standard Helvetica is built-in)
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2px solid #34394D',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34394D',
        textTransform: 'uppercase'
    },
    section: {
        margin: 10,
        padding: 10,
    },
    label: {
        fontSize: 9,
        color: '#666666',
        marginBottom: 2,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 11,
        marginBottom: 10,
        color: '#111827'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    approvalBlock: {
        marginTop: 30,
        borderTop: '1px solid #E5E7EB',
        paddingTop: 20,
    },
    signatureBox: {
        marginTop: 30,
        height: 50,
        border: '1px solid #CCC',
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        fontSize: 8,
        color: '#AAA',
        textAlign: 'center',
    }
});

interface ApprovalPdfProps {
    data: {
        logoPath: string
        id: string
        title: string
        description: string
        detailedDescription?: string | null
        expenseType?: string
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

// Logo path should be absolute for server-side rendering usually, 
// or relative if setup correctly. Using absolute path based on workspace.
const LOGO_SRC = "c:/Apps/DOA/doa-app/public/cwit-logo.svg";

export const ApprovalDocument = ({ data }: ApprovalPdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            <View style={styles.header}>
                <View>
                    <Image src={LOGO_SRC} style={{ width: 120, height: 'auto' }} />
                </View>
                <View>
                    <Text style={styles.headerText}>Spend Approvals</Text>
                    <Text style={{ fontSize: 10, color: '#C02D76', textAlign: 'right', marginTop: 4 }}>
                        {data.id.slice(-8).toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: '#34394D', fontWeight: 'bold' }}>{data.title}</Text>
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#111827' }}>
                    {data.justification}
                </Text>
            </View>

            {data.detailedDescription && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Detailed Description of Goods/Services</Text>
                    <Text style={{ fontSize: 11, color: '#111827', marginTop: 4 }}>
                        {data.detailedDescription}
                    </Text>
                </View>
            )}


            <View style={styles.row}>
                <View style={{ width: '45%' }}>
                    <Text style={styles.label}>TOTAL AMOUNT</Text>
                    <Text style={{ ...styles.value, fontSize: 16, color: '#C02D76', fontWeight: 'bold' }}>
                        {data.currency} {data.amount.toLocaleString()}
                    </Text>
                </View>
                <View style={{ width: '45%' }}>
                    <Text style={styles.label}>SUPPLIER</Text>
                    <Text style={styles.value}>{data.supplier}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={{ width: '45%' }}>
                    <Text style={styles.label}>REQUESTED BY</Text>
                    <Text style={styles.value}>{data.requester}</Text>
                </View>
            </View>

            {/* Approval Section */}
            <View style={styles.approvalBlock}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#34394D', marginBottom: 10 }}>AUTHORISATION CHAIN</Text>

                <View>
                    {data.approvals.map((approval, idx) => (
                        <View key={idx} style={{
                            marginBottom: 8,
                            padding: 8,
                            borderBottom: '1px solid #F3F4F6',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 9, color: '#666', fontWeight: 'bold' }}>{approval.role.toUpperCase()}</Text>
                            </View>

                            <View style={{ width: '60%', alignItems: 'flex-end' }}>
                                {approval.status === 'APPROVED' ? (
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#059669', fontWeight: 'bold' }}>
                                            APPROVED
                                        </Text>
                                        <Text style={{ fontSize: 10, color: '#111827' }}>
                                            {approval.name}
                                        </Text>
                                        <Text style={{ fontSize: 8, color: '#6B7280' }}>
                                            {approval.date}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>
                                        Pending...
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={styles.footer}>
                Colombo West International Terminal • Official Record
            </Text>

        </Page>
    </Document >
);
