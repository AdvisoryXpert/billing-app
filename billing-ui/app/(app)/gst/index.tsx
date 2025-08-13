import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { listInvoices, type Invoice } from '../../../src/api/invoices';

type Status = 'draft' | 'sent' | 'paid' | 'overdue' | 'all';

const IN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttarakhand','Uttar Pradesh','West Bengal',
  'Puducherry','Chandigarh','Ladakh','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'
];

type Row = {
  id: number;
  invoice_number: string;
  date: string;
  client: string;
  client_state: string | null;
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
  total: number;
};

export default function GSTScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filters / config
  // IMPORTANT: default from = previous month start so July shows when you're in August
  const [from, setFrom] = useState(isoMonthStart(-1)); // prev month start
  const [to, setTo] = useState(isoToday());            // today
  const [homeState, setHomeState] = useState<string>('Karnataka');
  const [status, setStatus] = useState<Status>('all');
  const [inclusive, setInclusive] = useState(true);
  const [ratePct, setRatePct] = useState('18'); // default 18%

  // avoid double-fetch in dev/StrictMode
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    (async () => {
      setLoading(true); setErr(null);
      try {
        const inv = await listInvoices();
        // Treat 204/empty body safely
        const arr = Array.isArray(inv) ? inv : (inv ? [inv] : []);
        setInvoices(arr as any);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const rate = clampRate(ratePct);
    const fromDate = safeDate(from);
    const toDate = safeDate(to);
    if (toDate) toDate.setHours(23,59,59,999);

    return (invoices || [])
      .filter((iv: any) => {
        // date filter (use invoice_date directly from your payload)
        const ivDate = safeDate(iv.invoice_date || iv.date || iv.created_at);
        if (fromDate && ivDate && ivDate < fromDate) return false;
        if (toDate && ivDate && ivDate > toDate) return false;

        // status filter (case-insensitive), or no filter if 'all'
        if (status !== 'all') {
          const raw = (iv.status ?? '').toString().trim().toLowerCase();
          if (raw !== status) return false;
        }
        return true;
      })
      .map((iv: any) => {
        // client comes embedded on the invoice
        const c = iv.client || {};
        const cstate: string = c.state || guessState(c.address || '') || '';

        const inter = !sameState(homeState, cstate);

        const totalNum = toNum(iv.total);
        const { taxable, tax } = computeTax(totalNum, rate, inclusive);

        let igst = 0, cgst = 0, sgst = 0;
        if (inter) igst = tax; else { cgst = tax / 2; sgst = tax / 2; }

        const rawDate = iv.invoice_date || iv.date || iv.created_at || '';
        const dateOnly = rawDate ? String(rawDate).slice(0,10) : '';

        return {
          id: iv.id,
          invoice_number: iv.invoice_number || iv.number || `INV-${iv.id}`,
          date: dateOnly,
          client: c.name || `#${iv.client_id}`,
          client_state: cstate || null,
          taxable,
          igst,
          cgst,
          sgst,
          total: totalNum,
        } as Row;
      });
  }, [invoices, from, to, homeState, status, inclusive, ratePct]);

  const totals = useMemo(() => {
    return rows.reduce(
      (a, r) => ({
        taxable: a.taxable + r.taxable,
        igst: a.igst + r.igst,
        cgst: a.cgst + r.cgst,
        sgst: a.sgst + r.sgst,
        total: a.total + r.total,
      }),
      { taxable: 0, igst: 0, cgst: 0, sgst: 0, total: 0 }
    );
  }, [rows]);

  return (
    <View style={styles.page}>
      {/* Toolbar / Filters */}
      <View style={styles.toolbar}>
        <Text style={styles.h1}>GST Summary</Text>
        <View style={{ flex: 1 }} />

        <TextInput
          placeholder="From (YYYY-MM-DD)"
          value={from}
          onChangeText={setFrom}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="To (YYYY-MM-DD)"
          value={to}
          onChangeText={setTo}
          style={[styles.input, { marginLeft: 8 }]}
          autoCapitalize="none"
        />

        {/* HOME STATE DROPDOWN */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={homeState}
            onValueChange={(itemValue) => setHomeState(itemValue)}
            style={styles.picker}
          >
            {IN_STATES.map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
        </View>

        {/* STATUS FILTER (chips) */}
        <Select
          options={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
          ]}
          value={status}
          onChange={(v) => setStatus(v as Status)}
        />

        <Toggle
          label={inclusive ? 'Tax-Inclusive' : 'Tax-Exclusive'}
          toggled={inclusive}
          setToggled={setInclusive}
        />

        <TextInput
          placeholder="GST %"
          value={ratePct}
          onChangeText={setRatePct}
          keyboardType="numeric"
          style={[styles.input, { width: 90, marginLeft: 8 }]}
        />
      </View>

      {/* Totals cards */}
      <View style={styles.kpiRow}>
        <KPI title="Taxable" value={`₹${fmt(totals.taxable)}`} />
        <KPI title="IGST" value={`₹${fmt(totals.igst)}`} />
        <KPI title="CGST" value={`₹${fmt(totals.cgst)}`} />
        <KPI title="SGST" value={`₹${fmt(totals.sgst)}`} />
        <KPI title="Grand Total" value={`₹${fmt(totals.total)}`} />
      </View>

      {/* Table */}
      <View style={[styles.card, styles.shadow]}>
        <View style={styles.thead}>
          <Text style={[styles.th, styles.colInv]}>Invoice #</Text>
          <Text style={[styles.th, styles.colDate]}>Date</Text>
          <Text style={[styles.th, styles.colClient]}>Client</Text>
          <Text style={[styles.th, styles.colState]}>State</Text>
          <Text style={[styles.th, styles.colAmt]}>Taxable</Text>
          <Text style={[styles.th, styles.colAmt]}>IGST</Text>
          <Text style={[styles.th, styles.colAmt]}>CGST</Text>
          <Text style={[styles.th, styles.colAmt]}>SGST</Text>
          <Text style={[styles.th, styles.colAmt]}>Invoice Total</Text>
        </View>

        {loading ? (
          <View style={styles.center}><Text>Loading…</Text></View>
        ) : err ? (
          <View style={styles.center}><Text style={{ color: '#DC2626' }}>{err}</Text></View>
        ) : rows.length === 0 ? (
          <View style={styles.center}><Text>No invoices found for the selected filters.</Text></View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            renderItem={({ item, index }) => (
              <View style={[styles.tr, index % 2 ? styles.trOdd : styles.trEven]}>
                <View style={styles.colInv}><Text style={styles.bold}>{item.invoice_number}</Text></View>
                <View style={styles.colDate}><Text>{item.date}</Text></View>
                <View style={styles.colClient}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text>{item.client}</Text>
                  </ScrollView>
                </View>
                <View style={styles.colState}><Text>{item.client_state || '—'}</Text></View>
                <View style={styles.colAmt}><Text style={styles.num}>₹{fmt(item.taxable)}</Text></View>
                <View style={styles.colAmt}><Text style={styles.num}>₹{fmt(item.igst)}</Text></View>
                <View style={styles.colAmt}><Text style={styles.num}>₹{fmt(item.cgst)}</Text></View>
                <View style={styles.colAmt}><Text style={styles.num}>₹{fmt(item.sgst)}</Text></View>
                <View style={styles.colAmt}><Text style={styles.num}>₹{fmt(item.total)}</Text></View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

/* ===== tiny UI helpers ===== */

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <View style={[styles.kpi, styles.shadow]}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function Select<T extends string | number>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 40, marginLeft: 8 }}>
      <View style={{ flexDirection: 'row' }}>
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[
                { height: 36, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
                active && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
              ]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[{ color: '#374151', fontWeight: '600' }, active && { color: '#fff' }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Toggle({ label, toggled, setToggled }: { label: string; toggled: boolean; setToggled: (v: boolean) => void; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={() => setToggled(!toggled)}
      style={[
        { height: 36, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginLeft: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
        toggled && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
      ]}
    >
      <Text style={[{ color: '#374151', fontWeight: '700' }, toggled && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ===== logic helpers ===== */

function sameState(a: string, b: string) {
  return normState(a) === normState(b);
}
function normState(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '');
}
function guessState(address: string): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const st of IN_STATES) {
    if (lower.includes(st.toLowerCase())) return st;
  }
  return null;
}
function safeDate(v: any): Date | null {
  if (!v) return null;
  const s = String(v);
  const d = new Date(s.length > 10 ? s : `${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}
function toNum(v: any): number {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
function clampRate(rateText: string) {
  const n = Number(rateText);
  if (Number.isNaN(n) || n < 0) return 0;
  return n / 100;
}
function computeTax(total: number, rate: number, inclusive: boolean) {
  if (rate <= 0) return { taxable: total, tax: 0 };
  if (inclusive) {
    const taxable = total / (1 + rate);
    const tax = total - taxable;
    return { taxable, tax };
  } else {
    const taxable = total;
    const tax = total * rate;
    return { taxable, tax };
  }
}
function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function isoMonthStart(offsetMonths = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-01`;
}
function fmt(n: number) {
  try { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n); } catch { return String(Math.round(n*100)/100); }
}

const shadow = Platform.select({
  web:   { boxShadow: '0 8px 30px rgba(0,0,0,0.06)' } as any,
  default: { elevation: 3 },
});

const styles = StyleSheet.create({
  page: { gap: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center' },
  h1: { fontSize: 18, fontWeight: '800', color: '#111827' },

  input: {
    height: 36, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 10, backgroundColor: '#fff', minWidth: 150,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 36,
    width: 220,
  },

  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  kpi: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginRight: 12, marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC', minWidth: 180,
  },
  kpiTitle: { color: '#6B7280', fontSize: 12, marginBottom: 6 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#111827' },

  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC', minHeight: 180 },
  shadow,

  thead: {
    height: 44, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEF2F7',
    paddingHorizontal: 12, position: 'sticky' as any, top: 0, zIndex: 1,
  },
  th: { color: '#6B7280', fontSize: 12, fontWeight: '700' },

  colInv: { flex: 1.2 },
  colDate: { flex: 1 },
  colClient: { flex: 1.6 },
  colState: { flex: 1 },
  colAmt: { flex: 1 },

  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  trEven: { backgroundColor: '#FFFFFF' },
  trOdd: { backgroundColor: '#FBFCFE' },

  bold: { fontWeight: '700', color: '#111827' },
  num: { fontWeight: '700', color: '#111827' },

  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
});
