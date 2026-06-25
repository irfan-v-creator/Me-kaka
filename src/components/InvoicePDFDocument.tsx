import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { Order, CartItem } from '../types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0d0d0d',
    color: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 12,
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e5c158',
    letterSpacing: 2,
  },
  subtitleText: {
    fontSize: 8,
    color: '#a99260',
    letterSpacing: 1,
    marginTop: 4,
  },
  trnBox: {
    borderWidth: 1,
    borderColor: '#a99260',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#121212',
    textAlign: 'right',
  },
  trnTitle: {
    fontSize: 7,
    color: '#a99260',
    fontWeight: 'bold',
  },
  trnValue: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badgeContainerCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextCancelled: {
    color: '#ef4444',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 9,
    color: '#e5c158',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 3,
    fontWeight: 'bold',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
  },
  gridColumn: {
    flex: 1,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 4,
  },
  gridColumnLeft: {
    marginLeft: 0,
  },
  gridColumnRight: {
    marginRight: 0,
  },
  gridRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
  },
  gridLabel: {
    color: '#a99260',
    fontSize: 8,
    width: 80,
  },
  gridValue: {
    color: '#ffffff',
    fontSize: 8,
    flex: 1,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 4,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#161616',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    padding: 6,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    padding: 6,
    backgroundColor: '#0f0f0f',
  },
  colDesc: {
    flex: 2,
    fontSize: 8,
    color: '#ffffff',
  },
  colQty: {
    width: 40,
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
  colPrice: {
    width: 80,
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'right',
  },
  colTotal: {
    width: 90,
    fontSize: 8,
    color: '#e5c158',
    textAlign: 'right',
  },
  thText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a99260',
  },
  thTextCenter: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a99260',
    textAlign: 'center',
  },
  thTextRight: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a99260',
    textAlign: 'right',
  },
  totalsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  totalsWrapper: {
    width: 220,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 4,
    padding: 10,
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 8,
  },
  totalLabel: {
    color: '#a99260',
  },
  totalValue: {
    color: '#ffffff',
  },
  grandTotalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#262626',
    fontSize: 9,
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    color: '#e5c158',
  },
  grandTotalValue: {
    color: '#e5c158',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 7,
    color: '#a99260',
    lineHeight: 1.4,
  }
});

interface InvoicePDFDocumentProps {
  order: Order;
  items: CartItem[];
  vatPercentage: number;
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({
  order,
  items,
  vatPercentage,
}) => {
  const subtotal = items.reduce((acc, item) => acc + item.product.priceAED * item.quantity, 0);
  const discount = subtotal * 0.10; // 10% VIP Elite discount
  const basePriceAfterDiscount = subtotal - discount;
  const vatAmount = basePriceAfterDiscount * (vatPercentage / 100);
  const grandTotal = basePriceAfterDiscount + vatAmount;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Svg viewBox="0 0 24 24" style={{ width: 28, height: 28 }}>
                <Path
                  d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"
                  stroke="#e5c158"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              <View>
                <Text style={styles.logoText}>STYLES & GRACE</Text>
                <Text style={styles.subtitleText}>TRADING L.L.C</Text>
                <Text style={{ fontSize: 7, color: '#a99260', marginTop: 3 }}>
                  Shop 22, Al Attar Shopping Mall, Karama - Dubai, UAE • +971 58 825 7372
                </Text>
              </View>
            </View>
            <View style={styles.trnBox}>
              <Text style={styles.trnTitle}>OFFICIAL UAE TAX IDENTIFICATION</Text>
              <Text style={styles.trnValue}>TRN: 100342981500003</Text>
            </View>
          </View>

          {/* Badge */}
          {order.status === 'Cancelled' ? (
            <View style={styles.badgeContainerCancelled}>
              <Text style={styles.badgeTextCancelled}>
                ✕ ORDER REVOKED & CANCELLED
              </Text>
            </View>
          ) : (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                ✓ ORDER CONFIRMED & SOVEREIGN LOCK SECURED
              </Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.gridContainer}>
            {/* Invoice Info */}
            <View style={[styles.gridColumn, styles.gridColumnLeft]}>
              <Text style={styles.sectionTitle}>Invoice Specifications</Text>
              
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Invoice ID:</Text>
                <Text style={styles.gridValue}>{order.id}</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Timestamp:</Text>
                <Text style={styles.gridValue}>{order.orderTime}</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Regulatory Seal:</Text>
                <Text style={styles.gridValue}>DUBAI-DFSA-SECURE</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Licence No:</Text>
                <Text style={styles.gridValue}>981244 • Dubai, UAE</Text>
              </View>
            </View>

            {/* Client Info */}
            <View style={[styles.gridColumn, styles.gridColumnRight]}>
              <Text style={styles.sectionTitle}>VIP Patron Details</Text>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>VIP Patron:</Text>
                <Text style={styles.gridValue}>{order.clientName || 'VIP Patron'}</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Contact Phone:</Text>
                <Text style={styles.gridValue}>{order.customerPhone}</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Coordinates:</Text>
                <Text style={styles.gridValue}>{order.deliveryCoordinates || 'Downtown Dubai Flagship Lounge'}</Text>
              </View>

              {order.bespokeNotes && (
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Bespoke Escort:</Text>
                  <Text style={styles.gridValue}>{order.bespokeNotes}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Curated Ledger */}
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>Curated Masterpieces Ledger</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colDesc}><Text style={styles.thText}>Masterpiece Description</Text></View>
              <View style={styles.colQty}><Text style={styles.thTextCenter}>Qty</Text></View>
              <View style={styles.colPrice}><Text style={styles.thTextRight}>Unit Price</Text></View>
              <View style={styles.colTotal}><Text style={styles.thTextRight}>Total Value</Text></View>
            </View>

            {items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.colDesc}>
                  <Text>{item.product.nameEn}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text>{item.product.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text>{(item.product.priceAED * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsWrapper}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Bespoke Subtotal:</Text>
                <Text style={styles.totalValue}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VIP Elite Member Discount (10%):</Text>
                <Text style={styles.totalValue}>-{discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>UAE VAT Regulatory ({vatPercentage}%):</Text>
                <Text style={styles.totalValue}>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Sovereign Grand Total:</Text>
                <Text style={styles.grandTotalValue}>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Styles & Grace - Trading L.L.C • Shop 22, Al Attar Shopping Mall, Karama - Dubai, UAE</Text>
          <Text style={{ marginTop: 2 }}>
            Reference Phone: +971 55 395 7591 • This document is a legally appointed financial ledger.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
