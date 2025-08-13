import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native'; // ← add Platform

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <View style={[styles.card, styles.shadow]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

export default function Dashboard() {
  return (
    <View style={styles.page}>
      <View style={styles.row}>
        <Card title="Total Revenue" value="₹12,50,000" sub="+8.4% vs last month" />
        <Card title="Outstanding"   value="₹2,76,000"  sub="23 invoices overdue" />
        <Card title="Invoices"      value="412"        sub="this fiscal year" />
        <Card title="Clients"       value="138"        sub="active" />
      </View>

      <View style={styles.row}>
        <View style={[styles.panel, styles.shadow]}>
          <Text style={styles.panelTitle}>Recent Invoices</Text>
          <View style={styles.listRow}><Text style={styles.listLeft}>INV-2025-0412</Text><Text style={styles.listRight}>₹12,600</Text></View>
          <View style={styles.listRow}><Text style={styles.listLeft}>INV-2025-0411</Text><Text style={styles.listRight}>₹8,320</Text></View>
          <View style={styles.listRow}><Text style={styles.listLeft}>INV-2025-0410</Text><Text style={styles.listRight}>₹21,000</Text></View>
          <View style={styles.listFoot}><Text style={styles.link}>View all →</Text></View>
        </View>

        <View style={[styles.panel, styles.shadow]}>
          <Text style={styles.panelTitle}>Payments</Text>
          <View style={styles.listRow}><Text style={styles.listLeft}>PMT-3391</Text><Text style={styles.listRight}>₹6,000</Text></View>
          <View style={styles.listRow}><Text style={styles.listLeft}>PMT-3389</Text><Text style={styles.listRight}>₹14,200</Text></View>
          <View style={styles.listRow}><Text style={styles.listLeft}>PMT-3387</Text><Text style={styles.listRight}>₹3,500</Text></View>
          <View style={styles.listFoot}><Text style={styles.link}>View all →</Text></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginRight: 14, marginBottom: 14, width: 280,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC',
  },
  cardTitle: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  cardSub: { color: '#6B7280', marginTop: 6 },

  panel: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginRight: 14, marginBottom: 14, flexGrow: 1, minWidth: 360,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC',
  },
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, color: '#111827' },
  listRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F2F5',
  },
  listLeft: { color: '#374151' },
  listRight: { marginLeft: 'auto', fontWeight: '700', color: '#111827' },
  listFoot: { alignItems: 'flex-end', paddingTop: 10 },
  link: { color: '#2563EB', fontWeight: '600' },

  shadow: Platform.select({
    web:   { boxShadow: '0 6px 24px rgba(0,0,0,0.06)' } as any,
    default: { elevation: 2 },
  }),
});
