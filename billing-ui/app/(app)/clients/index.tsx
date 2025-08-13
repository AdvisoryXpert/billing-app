import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, ActivityIndicator, Platform, ScrollView
} from 'react-native';
import {
  listClients, createClient, updateClient, deleteClient, type Client
} from '../../../src/api/clients';

type Draft = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  gstin?: string;
  state?: string;
};

export default function Clients() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: '', email: '', phone: '', company: '', address: '' , state: '', gstin: ''});

  // Load
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await listClients();
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load clients');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Search + Sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? items.filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.company || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q) ||
          (c.state || '').toLowerCase().includes(q) ||
          (c.gstin|| '').toLowerCase().includes(q)
        )
      : items.slice();
    base.sort((a, b) => {
      const an = (a.name || '').toLowerCase();
      const bn = (b.name || '').toLowerCase();
      return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    return base;
  }, [items, search, sortAsc]);

  // UI handlers
  const openCreate = () => { setEditing(null); setDraft({ name: '', email: '', phone: '', company: '', address: '' , state:'' , gstin:'' }); setOpen(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setDraft({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      address: c.address || '',
      state: c.state || '',
      gstin: c.gstin || '',
    });
    setOpen(true);
  };
  const save = async () => {
    if (!draft.name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    setBusy(true); setError(null);
    try {
      if (editing) {
        const saved = await updateClient(editing.id, { ...draft });
        setItems(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      } else {
        const saved = await createClient({ ...draft });
        setItems(prev => [saved, ...prev]);
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Save failed');
    } finally { setBusy(false); }
  };
  const remove = (c: Client) => {
    Alert.alert('Delete client', `Delete ${c.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await deleteClient(c.id);
            setItems(prev => prev.filter(p => p.id !== c.id));
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
        <Text style={styles.h1}>Client List</Text>
        <View style={{ flex: 1 }} />
        <TextInput
          placeholder="Search name, email, phone, company, address…"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setSortAsc(s => !s)}>
          <Text style={styles.btnGhostText}>{sortAsc ? 'A→Z' : 'Z→A'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openCreate}>
          <Text style={styles.btnPrimaryText}>Add client</Text>
        </TouchableOpacity>
      </View>

      {/* Table Card */}
      <View style={[styles.card, styles.shadow]}>
        {/* Header (sticky) */}
        <View style={[styles.thead]}>
          <Text style={[styles.th, styles.thName]}>Name</Text>
          <Text style={[styles.th, styles.thCompany]}>Company</Text>
          <Text style={[styles.th, styles.thEmail]}>Email</Text>
          <Text style={[styles.th, styles.thPhone]}>Phone</Text>
          <Text style={[styles.th, styles.thAddress]}>Address</Text>
          <Text style={[styles.th, styles.thActions]}>Actions</Text>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.err}>{error}</Text></View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: '#6B7280' }}>No clients found</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item, index }) => (
              <View style={[styles.tr, index % 2 === 0 ? styles.trEven : styles.trOdd]}>
                <View style={styles.tdName}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.email || '—'}</Text>
                </View>
                <View style={styles.tdCompany}><Text style={styles.text}>{item.company || '—'}</Text></View>
                <View style={styles.tdEmail}><Text style={styles.text}>{item.email || '—'}</Text></View>
                <View style={styles.tdPhone}><Text style={styles.text}>{item.phone || '—'}</Text></View>
                <View style={styles.tdAddress}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.text}>{item.address || '—'}</Text>
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

      {/* Drawer Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.drawerWrap}>
          <View style={[styles.drawer, styles.shadow]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{editing ? 'Edit client' : 'New client'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={draft.name} onChangeText={(t) => setDraft(d => ({ ...d, name: t }))} placeholder="Client name" />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={draft.email}
                onChangeText={(t) => setDraft(d => ({ ...d, email: t }))} placeholder="name@example.com" />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Phone</Text>
              <TextInput style={styles.input} value={draft.phone}
                onChangeText={(t) => setDraft(d => ({ ...d, phone: t }))} placeholder="Phone number" />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Company</Text>
              <TextInput style={styles.input} value={draft.company}
                onChangeText={(t) => setDraft(d => ({ ...d, company: t }))} placeholder="Company name" />
            </View>
            <View style={styles.formRow}>
  <Text style={styles.label}>State</Text>
  <TextInput
    style={styles.input}
    value={draft.state}
    onChangeText={(t) => setDraft(d => ({ ...d, state: t }))}
    placeholder="e.g., Maharashtra"
  />
</View>
<View style={styles.formRow}>
  <Text style={styles.label}>GSTIN</Text>
  <TextInput
    style={styles.input}
    value={draft.gstin}
    onChangeText={(t) => setDraft(d => ({ ...d, gstin: t }))}
    autoCapitalize="characters"
    placeholder="e.g., 27ABCDE1234F1Z5"
  />
</View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} multiline value={draft.address}
                onChangeText={(t) => setDraft(d => ({ ...d, address: t }))} placeholder="Street, City, State" />
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
    paddingHorizontal: 10, backgroundColor: '#fff', minWidth: 280, marginRight: 8,
  },
  btn: {
    height: 36, paddingHorizontal: 14, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  btnGhost: { backgroundColor: '#fff' },
  btnGhostText: { color: '#374151', fontWeight: '700' },
  btnPrimary: { backgroundColor: '#2563EB', borderColor: '#2563EB', marginLeft: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },

  // Table card
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC', minHeight: 200 },
  shadow,

  thead: {
    height: 44, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEF2F7',
    paddingHorizontal: 12, position: 'sticky' as any, top: 0, zIndex: 1,
  },

  th: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  thName: { flex: 2 }, thCompany: { flex: 1.2 }, thEmail: { flex: 1.4 }, thPhone: { flex: 1 }, thAddress: { flex: 1.8 }, thActions: { width: 140, textAlign: 'right' },

  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  trEven: { backgroundColor: '#FFFFFF' },
  trOdd: { backgroundColor: '#FBFCFE' },

  tdName: { flex: 2, paddingRight: 10 },
  tdCompany: { flex: 1.2 },
  tdEmail: { flex: 1.4 },
  tdPhone: { flex: 1 },
  tdAddress: { flex: 1.8 },
  tdActions: { width: 140, flexDirection: 'row', justifyContent: 'flex-end' },

  name: { fontWeight: '700', color: '#111827' },
  sub: { color: '#6B7280', marginTop: 2 },
  text: { color: '#374151' },

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
    width: 520, maxWidth: 520, height: '100%' as any,
    backgroundColor: '#fff', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#E6E8EC',
    padding: 16,
  },
  drawerHeader: { height: 44, flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  drawerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  close: { marginLeft: 'auto', fontSize: 18, color: '#6B7280' },

  formRow: { marginTop: 8 },
  label: { color: '#6B7280', marginBottom: 6 },
  input: { height: 40, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#fff' },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  drawerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
});
