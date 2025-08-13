// app/(app)/payments/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, ActivityIndicator, Platform, ScrollView
} from 'react-native';
import { listInvoices, type Invoice } from '../../../src/api/invoices';
import {
  listPayments, createPayment, updatePayment, deletePayment,
  type Payment
} from '../../../src/api/payments';

type Draft = {
  invoice_id?: number;
  payment_date: string;
  amount: string;          // keep as string in UI, send as "123.45"
  payment_method: string;
  note?: string;
};

const METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Cheque', 'Other'] as const;
type SortKey = 'date' | 'amount';

export default function Payments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [draft, setDraft] = useState<Draft>({
    invoice_id: undefined,
    payment_date: isoToday(),
    amount: '',
    payment_method: 'UPI',
    note: '',
  });

  // Load data
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [inv, pays] = await Promise.all([listInvoices(), listPayments()]);
      setInvoices(inv);
      setItems(pays);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load payments');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Search + Sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = items.slice();
    if (q) {
      base = base.filter(p =>
        (p.invoice?.invoice_number || '').toLowerCase().includes(q) ||
        (p.payment_method || '').toLowerCase().includes(q) ||
        (p.note || '').toLowerCase().includes(q) ||
        (p.amount || '').toLowerCase().includes(q)
      );
    }
    base.sort((a, b) => {
      if (sortKey === 'date') {
        const ad = a.payment_date; const bd = b.payment_date;
        return sortAsc ? ad.localeCompare(bd) : bd.localeCompare(ad);
      } else {
        const aa = Number(a.amount || 0); const bb = Number(b.amount || 0);
        return sortAsc ? aa - bb : bb - aa;
      }
    });
    return base;
  }, [items, search, sortKey, sortAsc]);

  // Handlers
  const openCreate = () => {
    setEditing(null);
    setDraft({
      invoice_id: invoices[0]?.id,
      payment_date: isoToday(),
      amount: '',
      payment_method: 'UPI',
      note: '',
    });
    setOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    setDraft({
      invoice_id: p.invoice_id,
      payment_date: p.payment_date,
      amount: p.amount || '',
      payment_method: p.payment_method || 'UPI',
      note: p.note || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.invoice_id) { Alert.alert('Validation', 'Invoice is required'); return; }
    if (!isIsoDate(draft.payment_date)) { Alert.alert('Validation', 'Date must be YYYY-MM-DD'); return; }
    const amt = normalizeAmount(draft.amount);
    if (amt == null) { Alert.alert('Validation', 'Amount must be a valid number (e.g. 5000.00)'); return; }

    setBusy(true); setError(null);
    try {
      if (editing) {
        const saved = await updatePayment(editing.id, {
          invoice_id: draft.invoice_id,
          payment_date: draft.payment_date,
          amount: amt,
          payment_method: draft.payment_method,
          note: (draft.note || '').trim() || undefined,
        });
        setItems(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      } else {
        const saved = await createPayment({
          invoice_id: draft.invoice_id,
          payment_date: draft.payment_date,
          amount: amt,
          payment_method: draft.payment_method,
          note: (draft.note || '').trim() || undefined,
        });
        setItems(prev => [saved, ...prev]);
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = (p: Payment) => {
    Alert.alert('Delete payment', `Delete payment for ${p.invoice?.invoice_number || `#${p.invoice_id}`}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await deletePayment(p.id);
            setItems(prev => prev.filter(x => x.id !== p.id));
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
          } finally { setBusy(false); }
        }
      }
    ]);
  };

  return (
    <View style={styles.page}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.h1}>Payment List</Text>
        <View style={{ flex: 1 }} />
        <TextInput
          placeholder="Search invoice #, amount, method, note…"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        <Select
          options={[
            { value: 'date', label: `Sort: ${sortAsc ? 'Oldest' : 'Newest'}` },
            { value: 'amount', label: `Sort by Amount ${sortAsc ? '↑' : '↓'}` },
          ]}
          value={sortKey}
          onChange={(v) => setSortKey(v as SortKey)}
        />
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setSortAsc(s => !s)}>
          <Text style={styles.btnGhostText}>{sortAsc ? 'Asc' : 'Desc'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openCreate}>
          <Text style={styles.btnPrimaryText}>New payment</Text>
        </TouchableOpacity>
      </View>

      {/* Table Card */}
      <View style={[styles.card, styles.shadow]}>
        {/* Header */}
        <View style={styles.thead}>
          <Text style={[styles.th, styles.thInv]}>Invoice #</Text>
          <Text style={[styles.th, styles.thDate]}>Date</Text>
          <Text style={[styles.th, styles.thAmt]}>Amount</Text>
          <Text style={[styles.th, styles.thMethod]}>Method</Text>
          <Text style={[styles.th, styles.thNote]}>Note</Text>
          <Text style={[styles.th, styles.thActions]}>Actions</Text>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.err}>{error}</Text></View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}><Text style={{ color: '#6B7280' }}>No payments</Text></View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item, index }) => (
              <View style={[styles.tr, index % 2 === 0 ? styles.trEven : styles.trOdd]}>
                <View style={styles.tdInv}><Text style={styles.num}>{item.invoice?.invoice_number || `#${item.invoice_id}`}</Text></View>
                <View style={styles.tdDate}><Text style={styles.text}>{item.payment_date}</Text></View>
                <View style={styles.tdAmt}><Text style={styles.total}>₹{fmt(item.amount)}</Text></View>
                <View style={styles.tdMethod}><Text style={styles.text}>{item.payment_method}</Text></View>
                <View style={styles.tdNote}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.text}>{item.note || '—'}</Text>
                  </ScrollView>
                </View>
                <View style={styles.tdActions}>
                  <TouchableOpacity style={[styles.action, styles.linkBtn]} onPress={() => openEdit(item)}>
                    <Text style={styles.link}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, styles.dangerBtn]} onPress={() => remove(item)}>
                    <Text style={styles.danger}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Drawer Form */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.drawerWrap}>
          <View style={[styles.drawer, styles.shadow]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{editing ? 'Edit payment' : 'New payment'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Invoice *</Text>
              <Select
                options={invoices.map(iv => ({ value: iv.id, label: `${iv.invoice_number} (₹${fmt(iv.total as any)})` }))}
                value={draft.invoice_id}
                onChange={(v) => setDraft(d => ({ ...d, invoice_id: v as number }))}
              />
            </View>

            <View style={styles.formInline}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Payment date *</Text>
                <TextInput
                  value={draft.payment_date}
                  onChangeText={(t) => setDraft(d => ({ ...d, payment_date: t }))}
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Method *</Text>
                <Select
                  options={METHODS.map(m => ({ value: m, label: m }))}
                  value={draft.payment_method}
                  onChange={(v) => setDraft(d => ({ ...d, payment_method: v as string }))}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Amount *</Text>
              <TextInput
                value={draft.amount}
                keyboardType="numeric"
                onChangeText={(t) => setDraft(d => ({ ...d, amount: t }))}
                style={styles.input}
                placeholder="e.g. 5000.00"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                value={draft.note}
                onChangeText={(t) => setDraft(d => ({ ...d, note: t }))}
                style={[styles.input, styles.inputMultiline]}
                multiline
                placeholder="Optional note"
              />
            </View>

            {!!error && <Text style={styles.err}>{error}</Text>}

            <View style={styles.drawerActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setOpen(false)} disabled={busy}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={save} disabled={busy}>
                <Text style={styles.btnPrimaryText}>{busy ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===== helpers & small components ===== */

function fmt(n: string | number) {
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return String(n);
  try { return new Intl.NumberFormat('en-IN').format(num); } catch { return String(num); }
}
function normalizeAmount(input: string): string | null {
  const n = Number(input);
  if (Number.isNaN(n) || n < 0) return null;
  return n.toFixed(2);
}
function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function isIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function Select<T extends string | number>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  // RNW-safe: button group as a select
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 40 }}>
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

const shadow = Platform.select({
  web:   { boxShadow: '0 8px 30px rgba(0,0,0,0.06)' } as any,
  default: { elevation: 3 },
});

const styles = StyleSheet.create({
  page: { gap: 12 },

  // Toolbar
  h1: { fontSize: 18, fontWeight: '800', color: '#111827' },
  toolbar: { flexDirection: 'row', alignItems: 'center' },
  search: {
    height: 36, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 10, backgroundColor: '#fff', minWidth: 260, marginRight: 8,
  },
  btn: {
    height: 36, paddingHorizontal: 14, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { color: '#374151', fontWeight: '700' },
  btnPrimary: { backgroundColor: '#2563EB', borderColor: '#2563EB', marginLeft: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },

  // Table
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC', minHeight: 200 },
  shadow,

  thead: {
    height: 44, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEF2F7',
    paddingHorizontal: 12, position: 'sticky' as any, top: 0, zIndex: 1,
  },
  th: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  thInv: { flex: 1.4 }, thDate: { flex: 1.1 }, thAmt: { flex: 1 }, thMethod: { flex: 1 }, thNote: { flex: 2 }, thActions: { width: 160, textAlign: 'right' },

  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  trEven: { backgroundColor: '#FFFFFF' },
  trOdd: { backgroundColor: '#FBFCFE' },

  tdInv: { flex: 1.4 },
  tdDate: { flex: 1.1 },
  tdAmt: { flex: 1 },
  tdMethod: { flex: 1 },
  tdNote: { flex: 2 },
  tdActions: { width: 160, flexDirection: 'row', justifyContent: 'flex-end' },

  num: { fontWeight: '700', color: '#111827' },
  text: { color: '#374151' },
  total: { color: '#111827', fontWeight: '800' },

  action: { height: 30, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  linkBtn: { backgroundColor: '#fff' },
  dangerBtn: { backgroundColor: '#fff' },
  link: { color: '#2563EB', fontWeight: '700' },
  danger: { color: '#DC2626', fontWeight: '700' },

  empty: { alignItems: 'center', padding: 18 },
  center: { padding: 30, alignItems: 'center', justifyContent: 'center' },

  // Drawer
  drawerWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'flex-end' },
  drawer: {
    width: 560, maxWidth: 560, height: '100%' as any,
    backgroundColor: '#fff', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#E6E8EC',
    padding: 16,
  },
  drawerHeader: { height: 44, flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  drawerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  close: { marginLeft: 'auto', fontSize: 18, color: '#6B7280' },

  formRow: { marginTop: 8 },
  formInline: { flexDirection: 'row', marginTop: 8 },
  label: { color: '#6B7280', marginBottom: 6 },
  input: { height: 40, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#fff' },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  drawerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
});