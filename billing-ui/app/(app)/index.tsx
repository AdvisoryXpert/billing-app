/* Dashboard (app/index.tsx) */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { listInvoices, type Invoice } from '../../src/api/invoices';
import { listClients, type Client } from '../../src/api/clients';
import { listPayments, type Payment } from '../../src/api/payments';
import { DashboardCharts } from '../../components/DashboardCharts';

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients,  setClients]  = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const { width: winW } = useWindowDimensions();
  const isNarrow = winW < 900;

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const [inv, cls, pmt] = await Promise.all([
          listInvoices(),
          listClients(),
          listPayments?.() ?? Promise.resolve([] as any),
        ]);
        setInvoices(inv ?? []);
        setClients(cls ?? []);
        setPayments(pmt ?? []);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ==== KPIs ==== */
  const {
    revenueFY, momText, outstandingAmt, overdueCount,
    invoiceCountFY, activeClientsFY, recentInv, recentPmt,
  } = useMemo(() => {
    const today = new Date();
    const { fyStart, fyEnd } = getFYBounds(today);

    const invPaidFY = invoices.filter(iv =>
      iv.status === 'paid' && inRange(iv.invoice_date, fyStart, fyEnd)
    );
    const revenueFY = sum(invPaidFY.map(iv => toNum(iv.total)));

    const { mStart, mEnd } = monthBounds(today);
    const { mStart: prevStart, mEnd: prevEnd } = monthBounds(addMonths(today, -1));
    const thisMonthPaid = sum(invoices.filter(iv => iv.status === 'paid' && inRange(iv.invoice_date, mStart, mEnd)).map(iv => toNum(iv.total)));
    const prevMonthPaid = sum(invoices.filter(iv => iv.status === 'paid' && inRange(iv.invoice_date, prevStart, prevEnd)).map(iv => toNum(iv.total)));
    const momText = fmtMoM(thisMonthPaid, prevMonthPaid);

    const outstandingInv = invoices.filter(iv => iv.status !== 'paid');
    const outstandingAmt = sum(outstandingInv.map(iv => toNum(iv.total)));
    const overdueCount = invoices.filter(iv => {
      if (iv.status === 'paid') return false;
      const dd = toDate(iv.due_date);
      return dd && dd < startOfDay(today);
    }).length;

    const invoiceCountFY = invoices.filter(iv => inRange(iv.invoice_date, fyStart, fyEnd)).length;
    const clientIdsFY = new Set(invoices.filter(iv => inRange(iv.invoice_date, fyStart, fyEnd)).map(iv => iv.client_id));
    const activeClientsFY = clientIdsFY.size;

    const recentInv = [...invoices].sort((a,b) => (a.invoice_date < b.invoice_date ? 1 : -1)).slice(0, 5);
    const recentPmt = [...payments].sort((a: any,b: any) => (getDate(a) < getDate(b) ? 1 : -1)).slice(0, 5);

    return { revenueFY, momText, outstandingAmt, overdueCount, invoiceCountFY, activeClientsFY, recentInv, recentPmt };
  }, [invoices, clients, payments]);

  // Fixed width for the two list panels on wide screens; full width on narrow
  const listColStyle = isNarrow ? styles.listColFull : styles.listColWide;

  return (
    <View style={styles.page}>
      {err ? <View style={[styles.card, styles.shadow]}><Text style={{ color: '#DC2626' }}>{err}</Text></View> : null}

      {/* KPI cards (unchanged) */}
      <View style={styles.row}>
        <Card title="Total Revenue" value={loading ? '—' : `₹${fmt(revenueFY)}`} sub={loading ? '' : momText} />
        <Card title="Outstanding"   value={loading ? '—' : `₹${fmt(outstandingAmt)}`}  sub={loading ? '' : `${overdueCount} invoices overdue`} />
        <Card title="Invoices"      value={loading ? '—' : String(invoiceCountFY)}      sub="this fiscal year" />
        <Card title="Clients"       value={loading ? '—' : String(activeClientsFY)}     sub="active" />
      </View>

      {/* Charts (unchanged) */}
      <View style={[styles.row, { width: '100%' }]}>
        <DashboardCharts invoices={invoices} payments={payments} />
      </View>

      {/* Lists — just make each column narrower on wide screens */}
      <View style={[styles.row, styles.rowSpread]}>
        {/* Recent Invoices */}
        <View style={listColStyle}>
          <View style={[styles.panel, styles.shadow, styles.listPanel]}>
            <Text style={styles.panelTitle}>Recent Invoices</Text>
            {loading ? (
              <Text>Loading…</Text>
            ) : recentInv.length === 0 ? (
              <Text>No invoices yet.</Text>
            ) : (
              recentInv.map((iv, i) => (
                <TouchableOpacity
                  key={iv.id ?? i}
                  style={styles.listRow}
                  onPress={() =>
                    router.push({ pathname: '/invoices/[id]', params: { id: String(iv.id) } })
                  }
                >
                  <Text style={styles.listLeft,styles.linkBlue}>{iv.invoice_number}</Text>
                  <Text style={[styles.listLeft, { marginLeft: 12, color: '#6B7280' }]}>{iv.invoice_date}</Text>
                  <Text style={styles.listRight}>₹{fmt(toNum(iv.total))}</Text>
                </TouchableOpacity>
              ))
            )}
            <View style={styles.listFoot}><Link href="/invoices" style={styles.link}>View all →</Link></View>
          </View>
        </View>

        {/* Payments */}
        <View style={listColStyle}>
          <View style={[styles.panel, styles.shadow, styles.listPanel]}>
            <Text style={styles.panelTitle}>Payments</Text>
            {loading ? (
              <Text>Loading…</Text>
            ) : recentPmt.length === 0 ? (
              <Text>No payments yet.</Text>
            ) : (
              recentPmt.map((p: any, i: number) => (
                <TouchableOpacity
                  key={p.id ?? i}
                  style={styles.listRow}
                  onPress={() =>
                    router.push({ pathname: '/payments/[id]', params: { id: String(p.id) } })
                  }
                >
                  <Text style={styles.listLeft,styles.linkBlue}>{p.reference || p.code || `PMT-${p.id}`}</Text>
                  <Text style={[styles.listLeft, { marginLeft: 12, color: '#6B7280' }]}>{(p.date || p.created_at || '').slice(0, 10)}</Text>
                  <Text style={styles.listRight}>₹{fmt(toNum(p.amount))}</Text>
                </TouchableOpacity>
              ))
            )}
            <View style={styles.listFoot}><Link href="/payments" style={styles.link}>View all →</Link></View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ===== helpers ===== */
function toNum(v: any): number { if (typeof v === 'number') return v; const n = Number(v); return Number.isNaN(n) ? 0 : n; }
function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }
function fmt(n: number) { try { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n); } catch { return String(Math.round(n * 100) / 100); } }
function toDate(s?: string | null) { if (!s) return null; const d = new Date(s); return isNaN(+d) ? null : d; }
function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function inRange(dateStr: string, start: Date, end: Date) { const d = toDate(dateStr); if (!d) return false; const t = d.getTime(); return t >= start.getTime() && t <= end.getTime(); }
function monthBounds(d: Date) { const y = d.getFullYear(), m = d.getMonth(); const mStart = new Date(y, m, 1); const mEnd = new Date(y, m + 1, 0, 23, 59, 59, 999); return { mStart, mEnd }; }
function addMonths(d: Date, delta: number) { const dt = new Date(d); dt.setMonth(dt.getMonth() + delta); return dt; }
function getFYBounds(d: Date) { const y = d.getFullYear(); const m = d.getMonth(); const fyStart = new Date(m >= 3 ? y : y - 1, 3, 1); const fyEnd = new Date(m >= 3 ? y + 1 : y, 2, 31, 23, 59, 59, 999); return { fyStart, fyEnd }; }
function fmtMoM(curr: number, prev: number) { if (prev <= 0 && curr > 0) return 'new vs last month'; if (prev <= 0 && curr <= 0) return '0% vs last month'; const pct = ((curr - prev) / prev) * 100; const sign = pct >= 0 ? '+' : ''; return `${sign}${pct.toFixed(1)}% vs last month`; }
function getDate(p: any) { return +(new Date(p.date || p.created_at || p.paid_at || 0)); }

/* ===== styles ===== */
const styles = StyleSheet.create({
  page: { gap: 1 },
  linkBlue: { color: '#2563EB' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  rowSpread: { justifyContent: 'space-between', alignItems: 'stretch' },

  // Narrow list columns
  listColWide: {
    width: 520,
    maxWidth: 520,
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 14,
  },
  listColFull: {
    width: '100%',
    maxWidth: '100%',
    marginBottom: 14,
  },

  // Generic card
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginRight: 14, marginBottom: 14, width: 280,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC',
  },
  cardTitle: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  cardSub: { color: '#6B7280', marginTop: 6 },

  // Panel (default)
  panel: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginRight: 14, marginBottom: 14, flexGrow: 1, minWidth: 360,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC',
  },
  // Override defaults inside narrow columns so width stays fixed
  listPanel: {
    flexGrow: 0,
    minWidth: 0,
    marginRight: 0,     // avoid pushing past the fixed column
    width: '100%',
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
