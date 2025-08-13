// app/(app)/invoices/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, ActivityIndicator, Platform, ScrollView
} from 'react-native';
import { listClients, type Client } from '../../../src/api/clients';
import {
  listInvoices, createInvoice, updateInvoice, deleteInvoice,
  type Invoice, type InvoiceStatus
} from '../../../src/api/invoices';

type Draft = {
  client_id?: number;
  invoice_date: string;  // YYYY-MM-DD
  due_date: string;      // YYYY-MM-DD
  total: string;         // as string for input; convert to number on save
  status: InvoiceStatus;
};

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];

export default function Invoices() {
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortAsc, setSortAsc] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [draft, setDraft] = useState<Draft>({
    client_id: undefined,
    invoice_date: isoToday(),
    due_date: isoPlusDays(7),
    total: '',
    status: 'draft',
  });

  // Load data
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [cs, inv] = await Promise.all([listClients(), listInvoices()]);
      setClients(cs);
      setItems(inv);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load invoices');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = items.slice();
    if (q) {
      base = base.filter(iv =>
        iv.invoice_number.toLowerCase().includes(q) ||
        String(iv.total).toLowerCase().includes(q) ||
        (clientName(clients, iv.client_id).toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') {
      base = base.filter(iv => iv.status === statusFilter);
    }
    base.sort((a, b) => {
      const ad = a.invoice_date; const bd = b.invoice_date;
      return sortAsc ? ad.localeCompare(bd) : bd.localeCompare(ad);
    });
    return base;
  }, [items, search, statusFilter, sortAsc, clients]);

  const openCreate = () => {
    setEditing(null);
    setDraft({
      client_id: clients[0]?.id,
      invoice_date: isoToday(),
      due_date: isoPlusDays(7),
      total: '',
      status: 'draft',
    });
    setOpen(true);
  };

  const openEdit = (iv: Invoice) => {
    setEditing(iv);
    setDraft({
      client_id: iv.client_id,
      invoice_date: iv.invoice_date,
      due_date: iv.due_date,
      total: String(iv.total ?? ''),
      status: iv.status as InvoiceStatus,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.client_id) { Alert.alert('Validation', 'Client is required'); return; }
    if (!isIsoDate(draft.invoice_date) || !isIsoDate(draft.due_date)) {
      Alert.alert('Validation', 'Dates must be YYYY-MM-DD'); return;
    }
    const totalNum = Number(draft.total);
    if (Number.isNaN(totalNum) || totalNum < 0) { Alert.alert('Validation', 'Total must be a valid amount'); return; }

    setBusy(true); setError(null);
    try {
      if (editing) {
        const saved = await updateInvoice(editing.id, {
          client_id: draft.client_id,
          invoice_date: draft.invoice_date,
          due_date: draft.due_date,
          total: totalNum,
          status: draft.status,
        });
        setItems(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      } else {
        const saved = await createInvoice({
          client_id: draft.client_id,
          invoice_date: draft.invoice_date,
          due_date: draft.due_date,
          total: totalNum,
          status: draft.status || 'draft',
        });
        setItems(prev => [saved, ...prev]);
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = (iv: Invoice) => {
    Alert.alert('Delete invoice', `Delete ${iv.invoice_number}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await deleteInvoice(iv.id);
            setItems(prev => prev.filter(p => p.id !== iv.id));
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
        <Text style={styles.h1}>Invoices List</Text>
        <View style={{ flex: 1 }} />

        <TextInput
          placeholder="Search #, client, total…"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setSortAsc(s => !s)}>
          <Text style={styles.btnGhostText}>{sortAsc ? 'Oldest' : 'Newest'}</Text>
        </TouchableOpacity>

        <Select
        options={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v as any)}
        />

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openCreate}>
          <Text style={styles.btnPrimaryText}>New invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Table Card */}
      <View style={[styles.card, styles.shadow]}>
        {/* Header */}
        <View style={styles.thead}>
          <Text style={[styles.th, styles.thNumber]}>Invoice #</Text>
          <Text style={[styles.th, styles.thClient]}>Client</Text>
          <Text style={[styles.th, styles.thDate]}>Date</Text>
          <Text style={[styles.th, styles.thDue]}>Due</Text>
          <Text style={[styles.th, styles.thTotal]}>Total</Text>
          <Text style={[styles.th, styles.thStatus]}>Status</Text>
          <Text style={[styles.th, styles.thActions]}>Actions</Text>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.err}>{error}</Text></View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}><Text style={{ color: '#6B7280' }}>No invoices</Text></View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item, index }) => (
              <View style={[styles.tr, index % 2 === 0 ? styles.trEven : styles.trOdd]}>
                <View style={styles.tdNumber}><Text style={styles.num}>{item.invoice_number}</Text></View>
                <View style={styles.tdClient}><Text style={styles.text}>{clientName(clients, item.client_id)}</Text></View>
                <View style={styles.tdDate}><Text style={styles.text}>{item.invoice_date}</Text></View>
                <View style={styles.tdDue}><Text style={styles.text}>{item.due_date}</Text></View>
                <View style={styles.tdTotal}><Text style={styles.total}>₹{fmt(item.total)}</Text></View>
                <View style={styles.tdStatus}><Badge status={item.status} /></View>
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
              <Text style={styles.drawerTitle}>{editing ? 'Edit invoice' : 'New invoice'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Client *</Text>
              <Select
                options={clients.map(c => ({ value: c.id, label: c.name }))}
                value={draft.client_id}
                onChange={(v) => setDraft(d => ({ ...d, client_id: v }))}
              />
            </View>

            <View style={styles.formInline}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Invoice date *</Text>
                <TextInput
                  value={draft.invoice_date}
                  onChangeText={(t) => setDraft(d => ({ ...d, invoice_date: t }))}
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Due date *</Text>
                <TextInput
                  value={draft.due_date}
                  onChangeText={(t) => setDraft(d => ({ ...d, due_date: t }))}
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.formInline}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Total *</Text>
                <TextInput
                  value={draft.total}
                  keyboardType="numeric"
                  onChangeText={(t) => setDraft(d => ({ ...d, total: t }))}
                  style={styles.input}
                  placeholder="e.g. 509000"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Status</Text>
                <Select
                  options={STATUSES.map(s => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
                  value={draft.status}
                  onChange={(v) => setDraft(d => ({ ...d, status: v as InvoiceStatus }))}
                />
              </View>
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

function clientName(list: Client[], id?: number) {
  const c = list.find(x => x.id === id);
  return c?.name || '—';
}
function fmt(n: number) {
  try { return new Intl.NumberFormat('en-IN').format(n); } catch { return String(n); }
}
function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function isoPlusDays(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function isIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function Badge({ status }: { status: InvoiceStatus }) {
  const map: Record<string, { bg: string; fg: string; text: string }> = {
    draft:  { bg: '#EEF2FF', fg: '#4F46E5', text: 'Draft' },
    sent:   { bg: '#ECFDF5', fg: '#059669', text: 'Sent' },
    paid:   { bg: '#E6FFFA', fg: '#0E7490', text: 'Paid' },
    overdue:{ bg: '#FEF2F2', fg: '#DC2626', text: 'Overdue' },
  };
  const v = map[status] || { bg: '#F3F4F6', fg: '#374151', text: status };
  return (
    <View style={{ backgroundColor: v.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color: v.fg, fontWeight: '700' }}>{v.text}</Text>
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
  // RNW-safe simple select: list of buttons; for long lists we can replace with a modal picker.
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
  thNumber: { flex: 1.2 }, thClient: { flex: 1.6 }, thDate: { flex: 1 }, thDue: { flex: 1 }, thTotal: { flex: 1 }, thStatus: { width: 120 }, thActions: { width: 160, textAlign: 'right' },

  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  trEven: { backgroundColor: '#FFFFFF' },
  trOdd: { backgroundColor: '#FBFCFE' },

  tdNumber: { flex: 1.2 },
  tdClient: { flex: 1.6 },
  tdDate: { flex: 1 },
  tdDue: { flex: 1 },
  tdTotal: { flex: 1 },
  tdStatus: { width: 120 },
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

  drawerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
});
