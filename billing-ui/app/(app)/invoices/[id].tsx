import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getInvoice, type Invoice } from '../../../src/api/invoices';

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const data = await getInvoice(Number(id));
        setInvoice(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const total = useMemo(() => (invoice ? Number(invoice.total) || 0 : 0), [invoice]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.headRow]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontWeight: '700', color: '#374151' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Invoice {invoice?.invoice_number || id}</Text>
        <View style={{ flex: 1 }} />
      </View>

      {loading ? <Text>Loading…</Text> : err ? (
        <Text style={{ color: '#DC2626' }}>{err}</Text>
      ) : invoice ? (
        <View style={[styles.card, styles.shadow]}>
          <Row label="Invoice #" value={invoice.invoice_number} />
          <Row label="Date" value={invoice.invoice_date} />
          <Row label="Due" value={invoice.due_date} />
          <Row label="Status" value={invoice.status} />
          <Row label="Client" value={(invoice as any).client?.name || `#${invoice.client_id}`} />
          <Row label="Total" value={`₹${fmt(total)}`} bold />
        </View>
      ) : (
        <Text>Not found.</Text>
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value?: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, bold && styles.bold]} numberOfLines={2}>{value ?? '—'}</Text>
    </View>
  );
}

function fmt(n: number) {
  try { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n); }
  catch { return String(Math.round(n * 100) / 100); }
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, paddingLeft: 0 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginLeft: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC'
  },
  row: { flexDirection: 'row', paddingVertical: 8, alignItems: 'center' },
  label: { width: 120, color: '#6B7280' },
  value: { flex: 1, color: '#111827', fontWeight: '600' },
  bold: { fontWeight: '800' },
  shadow: Platform.select({ web: { boxShadow: '0 6px 24px rgba(0,0,0,0.06)' } as any, default: { elevation: 2 } }),
});
