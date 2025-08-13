import React, { useEffect, useState, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { getSavedUser, logout as authLogout, type User } from '../../src/api/auth'; // <-- adjust path

type NavHref = '/' | '/clients' | '/invoices' | '/payments' | '/gst';
type NavItem = { href: NavHref; label: string; badge?: string };

const NAV: NavItem[] = [
  { href: '/',         label: 'Dashboard' },
  { href: '/clients',  label: 'Clients'   },
  { href: '/invoices', label: 'Invoices'  },
  { href: '/payments', label: 'Payments'  },
  { href: '/gst',      label: 'GST'       },
];

export default function Shell({
  children,
  user: userProp,
  onLogout, // optional: if you pass your own
}: {
  children: ReactNode;
  user?: User;                     // you can still pass user via props if you want
  onLogout?: () => void | Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | undefined>(userProp); // <- local state
  const router = useRouter();
  const path = usePathname();

  // Load saved user from storage on mount (if prop not provided)
  useEffect(() => {
    if (userProp) return; // prefer the prop if given
    (async () => {
      const u = await getSavedUser();
      if (u) setUser(u);
    })();
  }, [userProp]);

  const go = (href: NavHref) => router.push(href);

  const displayEmail = user?.email ?? 'Not signed in';
  const displayName  = user?.name  ?? (user?.email ? user.email.split('@')[0] : 'User');
  const initials     = getInitials(user?.name || user?.email || 'U');

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
      else await authLogout();         // default to API logout + clear storage
    } finally {
      setMenuOpen(false);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.app}>
      {/* Sidebar */}
      <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>EB</Text></View>
          {!collapsed && (
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.brandTitle}>Entbysys</Text>
              <Text style={styles.brandSub}>Billing</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setCollapsed(c => !c)}>
            <Text style={styles.collapse}>{collapsed ? '›' : '‹'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.section, collapsed && styles.sectionCollapsed]}>MENU</Text>

        <View style={styles.navList}>
          {NAV.map(item => {
            const active = path === item.href;
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => go(item.href)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <View style={styles.navDot} />
                {!collapsed && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
                    {item.badge ? (
                      <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
                    ) : null}
                  </View>
                )}
                {collapsed && <Text style={styles.navInitial}>{item.label[0]}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          {!collapsed && <Text style={styles.footerText}>v1.0.0</Text>}
        </View>
      </View>

      {/* Main */}
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.pageTitle}>{titleFromPath(path)}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Help</Text></TouchableOpacity>

            {/* User chip opens a Modal menu that overlaps the page */}
            <TouchableOpacity
              style={[styles.userChip, shadow]}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{displayEmail}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page content */}
        <View style={styles.content}>
          <View style={styles.container}>
            {children}
          </View>
        </View>

        {/* Modal dropdown (overlays content) */}
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
            <Pressable style={[styles.menu, shadow]} onPress={() => {}}>
              <View style={styles.menuHeader}>
                <View style={styles.avatarLg}><Text style={styles.avatarTextLg}>{initials}</Text></View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.menuName}>{displayName}</Text>
                  <Text style={styles.menuEmail}>{displayEmail}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/profile' as any); }}>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Logout</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

function titleFromPath(p: string) {
  if (!p || p === '/') return 'Dashboard';
  const name = p.replace(/^\/+/, '').split('/')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
function getInitials(s: string) {
  if (!s) return 'U';
  const at = s.indexOf('@');
  if (at > 0) return s[0].toUpperCase(); // first letter of email
  const parts = s.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] || 'U').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const shadow = Platform.select({
  web:   { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' } as any,
  default: { elevation: 2 },
});

const styles = StyleSheet.create({
  app: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F7FB' },

  // Sidebar
  sidebar: {
    width: 248, backgroundColor: '#FFFFFF',
    borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#E6E8EC',
  },
  sidebarCollapsed: { width: 76 },
  brand: {
    height: 64, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E6E8EC',
  },
  logo: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800' },
  brandTitle: { fontWeight: '800' },
  brandSub: { fontSize: 12, color: '#6B7280', marginTop: -2 },
  collapse: { fontSize: 18, color: '#6B7280', paddingHorizontal: 6 },

  section: { color: '#9CA3AF', fontSize: 12, marginTop: 10, marginBottom: 6, paddingHorizontal: 12 },
  sectionCollapsed: { textAlign: 'center', paddingHorizontal: 0 },

  navList: { paddingBottom: 8 },
  navItem: {
    height: 40, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, marginHorizontal: 6, borderRadius: 10, marginVertical: 2,
  },
  navItemActive: { backgroundColor: '#EFF6FF' },
  navDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#CBD5E1', marginRight: 10 },
  navText: { color: '#374151', fontSize: 14, fontWeight: '500' },
  navTextActive: { color: '#111827' },
  navInitial: { fontWeight: '700', color: '#374151', marginLeft: 2 },
  badge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#EEF2FF' },
  badgeText: { fontSize: 12, color: '#4F46E5' },

  sidebarFooter: { marginTop: 'auto', padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E6E8EC' },
  footerText: { color: '#9CA3AF', fontSize: 12 },

  // Main
  main: { flex: 1, flexDirection: 'column' },

  topbar: {
    height: 64, backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E6E8EC',
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8, backgroundColor: '#fff',
  },
  actionText: { color: '#374151', fontWeight: '600' },

  // User chip
  userChip: {
    height: 40, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    maxWidth: 260, marginLeft: 8,
  },
  avatar: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#1D4ED8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  userName: { color: '#111827', fontWeight: '700', fontSize: 12, maxWidth: 200 },
  userEmail: { color: '#6B7280', fontSize: 11, marginTop: -2, maxWidth: 200 },

  // Modal overlay & menu (overlaps page)
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 64 + 8,
    marginRight: 16,
    minWidth: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E6E8EC',
    paddingVertical: 6,
  },
  menuHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  avatarLg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#1D4ED8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTextLg: { color: '#fff', fontWeight: '800' },
  menuName: { fontWeight: '800', color: '#111827' },
  menuEmail: { color: '#6B7280', fontSize: 12, marginTop: -2 },

  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuItemText: { color: '#111827', fontSize: 14, fontWeight: '500' },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E6E8EC', marginVertical: 6 },

  content: { flex: 1, padding: 16 },
  container: { alignSelf: 'center', maxWidth: 1200, width: 1200, backgroundColor: 'transparent' },
});
