// app/components/Shell.tsx (drop-in)
import React, { useEffect, useState, type ReactNode } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Pressable,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import { getSavedUser, logout as authLogout, type User } from '../../src/api/auth';

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
  onLogout, // optional override
}: {
  children: ReactNode;
  user?: User;
  onLogout?: () => void | Promise<void>;
}) {
  const theme = useTheme() as any; // typed as AppTheme from our theme file
  const s = makeStyles(theme);

  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | undefined>(userProp);

  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (userProp) return;
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
      else await authLogout();
    } finally {
      setMenuOpen(false);
      router.replace('/login');
    }
  };

  return (
    <View style={[s.app, { backgroundColor: theme.colors.background }]}>
      {/* Sidebar */}
      <View style={[s.sidebar, collapsed && s.sidebarCollapsed, theme.custom?.shadow]}>
        <View style={[s.brand, { borderBottomColor: theme.colors.outline }]}>
          <View style={[s.logo, { backgroundColor: theme.colors.primary }]}>
            <Text style={s.logoText}>EB</Text>
          </View>
          {!collapsed && (
            <View style={{ marginLeft: 10 }}>
              <Text style={[s.brandTitle, { color: theme.colors.onSurface }]}>Entbysys</Text>
              <Text style={[s.brandSub, { color: theme.colors.onSurfaceVariant }]}>Billing</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setCollapsed(c => !c)}>
            <Text style={[s.collapse, { color: theme.colors.onSurfaceVariant }]}>{collapsed ? '›' : '‹'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.section, collapsed && s.sectionCollapsed, { color: theme.colors.onSurfaceVariant }]}>MENU</Text>

        <View style={s.navList}>
          {NAV.map(item => {
            const active = path === item.href;
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => go(item.href)}
                style={[
                  s.navItem,
                  active && { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <View style={[s.navDot, { backgroundColor: theme.colors.outline }]} />
                {!collapsed && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[
                        s.navText,
                        { color: active ? theme.colors.onPrimaryContainer : theme.colors.onSurface },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <View style={[s.badge, { backgroundColor: theme.colors.secondaryContainer }]}>
                        <Text style={[s.badgeText, { color: theme.colors.onSecondaryContainer }]}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
                {collapsed && <Text style={[s.navInitial, { color: theme.colors.onSurface }]}>{item.label[0]}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[s.sidebarFooter, { borderTopColor: theme.colors.outline }]}>
          {!collapsed && <Text style={[s.footerText, { color: theme.colors.onSurfaceVariant }]}>v1.0.0</Text>}
        </View>
      </View>

      {/* Main */}
      <View style={s.main}>
        {/* Fancy gradient topbar */}
        <LinearGradient
          colors={theme.custom?.gradient?.brand ?? [theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.topbar, theme.custom?.shadow, { borderBottomColor: 'transparent' }]}
        >
          <Text style={[s.pageTitle, { color: theme.colors.onPrimary }]}>{titleFromPath(path)}</Text>

          <View style={s.actions}>
            <TouchableOpacity
              style={[
                s.actionBtn,
                {
                  borderColor: 'rgba(255,255,255,0.35)',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                },
              ]}
            >
              <Text style={[s.actionText, { color: theme.colors.onPrimary }]}>Help</Text>
            </TouchableOpacity>

            {/* User chip */}
            <TouchableOpacity
              style={[
                s.userChip,
                {
                  borderColor: 'rgba(255,255,255,0.35)',
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.custom?.radii?.md ?? 12,
                },
              ]}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.85}
            >
              <View style={[s.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={[s.userName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={[s.userEmail, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={[s.content, { backgroundColor: theme.colors.background }]}>
          <View style={[s.container]}>
            {children}
          </View>
        </View>

        {/* Overlapping dropdown menu */}
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={s.overlay} onPress={() => setMenuOpen(false)}>
            <Pressable
              style={[
                s.menu,
                theme.custom?.shadow,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                  borderRadius: theme.custom?.radii?.lg ?? 20,
                },
              ]}
              onPress={() => {}}
            >
              <View style={s.menuHeader}>
                <View style={[s.avatarLg, { backgroundColor: theme.colors.primary }]}>
                  <Text style={s.avatarTextLg}>{initials}</Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={[s.menuName, { color: theme.colors.onSurface }]}>{displayName}</Text>
                  <Text style={[s.menuEmail, { color: theme.colors.onSurfaceVariant }]}>{displayEmail}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.menuItem} onPress={() => { setMenuOpen(false); router.push('/profile' as any); }}>
                <Text style={[s.menuItemText, { color: theme.colors.onSurface }]}>Profile</Text>
              </TouchableOpacity>
              <View style={[s.menuDivider, { backgroundColor: theme.colors.outline }]} />
              <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
                <Text style={[s.menuItemText, { color: theme.colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

/* ===== helpers ===== */
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

/* ===== styles (theme-aware) ===== */
const webShadow = Platform.select({
  web:   { boxShadow: '0 4px 20px rgba(2,6,23,0.08)' } as any,
  default: { elevation: 2 },
});

function makeStyles(theme: any) {
  return StyleSheet.create({
    app: { flex: 1, flexDirection: 'row' },

    // Sidebar
    sidebar: {
      width: 248,
      backgroundColor: theme.colors.surface,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: theme.colors.outline,
    },
    sidebarCollapsed: { width: 76 },
    brand: {
      height: 64, flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    },
    logo: {
      width: 36, height: 36, borderRadius: theme.custom?.radii?.sm ?? 10,
      alignItems: 'center', justifyContent: 'center',
    },
    logoText: { color: '#fff', fontWeight: '800' },
    brandTitle: { fontWeight: '800' },
    brandSub: { fontSize: 12, marginTop: -2 },
    collapse: { fontSize: 18, paddingHorizontal: 6 },

    section: { fontSize: 12, marginTop: 10, marginBottom: 6, paddingHorizontal: 12 },
    sectionCollapsed: { textAlign: 'center', paddingHorizontal: 0 },

    navList: { paddingBottom: 8 },
    navItem: {
      height: 40, flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, marginHorizontal: 6,
      borderRadius: theme.custom?.radii?.sm ?? 10, marginVertical: 2,
    },
    navDot: { width: 6, height: 6, borderRadius: 6, marginRight: 10 },
    navText: { fontSize: 14, fontWeight: '600' },
    navInitial: { fontWeight: '700', marginLeft: 2 },
    badge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 12 },

    sidebarFooter: { marginTop: 'auto', padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
    footerText: { fontSize: 12 },

    // Main
    main: { flex: 1, flexDirection: 'column' },

    topbar: {
      height: 64,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 0, // gradient, so no line
      borderBottomColor: 'transparent',
      ...webShadow,
    },
    pageTitle: { fontSize: 18, fontWeight: '800' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: {
      height: 36, paddingHorizontal: 12,
      borderRadius: theme.custom?.radii?.sm ?? 10,
      borderWidth: 1,
      alignItems: 'center', justifyContent: 'center', marginLeft: 8,
    },
    actionText: { fontWeight: '700' },

    // User chip
    userChip: {
      height: 40, paddingHorizontal: 10, borderWidth: 1,
      flexDirection: 'row', alignItems: 'center',
      maxWidth: 280, marginLeft: 8,
    },
    avatar: {
      width: 28, height: 28, borderRadius: theme.custom?.radii?.sm ?? 10,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    userName: { fontWeight: '800', fontSize: 12, maxWidth: 200 },
    userEmail: { fontSize: 11, marginTop: -2, maxWidth: 220 },

    // Modal overlay & menu
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.08)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
    },
    menu: {
      marginTop: 64 + 8,
      marginRight: 16,
      minWidth: 240,
      borderWidth: StyleSheet.hairlineWidth,
      paddingVertical: 6,
      borderRadius: theme.custom?.radii?.lg ?? 20,
    },
    menuHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
    avatarLg: {
      width: 36, height: 36, borderRadius: theme.custom?.radii?.sm ?? 10,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarTextLg: { color: '#fff', fontWeight: '800' },
    menuName: { fontWeight: '800' },
    menuEmail: { fontSize: 12, marginTop: -2 },
    menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
    menuItemText: { fontSize: 14, fontWeight: '600' },
    menuDivider: { height: StyleSheet.hairlineWidth, marginVertical: 6 },
    content: { flex: 1, padding: 16 },
    container: { alignSelf: 'center', maxWidth: 1200, width: 1200 },
  });
}
