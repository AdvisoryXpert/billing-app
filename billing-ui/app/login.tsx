import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { login } from '../src/api/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailInvalid = !!email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const canSubmit = !emailInvalid && email && password && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true); setErr(null);
    try {
      await login(email, password);   // sets Bearer token for all API calls
      router.replace('/');            // land in (app)/index
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Entbysys Billing</Text>
        <Text style={styles.sub}>Welcome back — sign in to continue</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailInvalid}
          style={styles.input}
        />
        {emailInvalid ? <HelperText type="error">Invalid email</HelperText> : null}

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          right={<TextInput.Icon icon={secure ? 'eye' : 'eye-off'} onPress={() => setSecure(s => !s)} />}
          style={styles.input}
        />

        {err ? <HelperText type="error">{err}</HelperText> : null}

        <Button mode="contained" onPress={onSubmit} loading={loading} disabled={!canSubmit as any}>
          Sign in
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#F7F8FA' },
  card: { width: '100%', maxWidth: 440, backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sub: { opacity: 0.7, marginBottom: 14 },
  input: { marginBottom: 10, backgroundColor: '#fff' },
});
