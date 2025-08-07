import 'package:flutter/material.dart';
import 'constants/app_theme.dart';
import 'screens/login/login_screen.dart';

void main() {
  runApp(const BillingApp());
}

class BillingApp extends StatelessWidget {
  const BillingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Billing App',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
       // '/dashboard': (context) => const MainScaffold(child: DashboardScreen()), // ✅ Wrap in MainScaffold
      },
    );
  }
}
