import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPayment, type Payment } from '../../../src/api/payments';

export default function PaymentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const data = await getPayment(Number(id));
        setPayment(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load payment');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.headRow]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontWeight: '700', color: '#374151' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment {payment?.id || id}</Text>
        <View style={{ flex: 1 }} />
      </View>

      {loading ? <Text>Loading…</Text> : err ? (
        <Text style={{ color: '#DC2626' }}>{err}</Text>
      ) : payment ? (
        <View style={[styles.card, styles.shadow]}>
          <Row label="Reference" value={(payment as any).reference || `PMT-${payment.id}`} />
          <Row label="Date" value={(payment as any).date || (payment as any).created_at || ''} />
          <Row label="Amount" value={`₹${fmt(Number((payment as any).amount ?? (payment as any).amount_paid ?? 0))}`} />
          <Row label="Method" value={(payment as any).method || (payment as any).mode || '—'} />
          {'invoice_id' in (payment as any) && <Row label="Invoice ID" value={String((payment as any).invoice_id)} />}
        </View>
      ) : (
        <Text>Not found.</Text>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>{value ?? '—'}</Text>
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
  shadow: Platform.select({ web: { boxShadow: '0 6px 24px rgba(0,0,0,0.06)' } as any, default: { elevation: 2 } }),
});
