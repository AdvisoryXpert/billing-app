import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:billing_frontend/widgets/custom_text_field.dart';
import 'package:billing_frontend/services/auth_service.dart';
import 'package:billing_frontend/widgets/main_scaffold.dart';
import '../dashboard/dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isLoading = false;
  String? error;

  Future<void> handleLogin() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    final result = await AuthService.login(
      emailController.text.trim(),
      passwordController.text.trim(),
    );

    setState(() => isLoading = false);

    if (result != null && result['token'] != null) {
      final String accessToken = result['token']; // ✅ assign token to local variable

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => MainScaffold(
            child: const DashboardScreen(),
            accessToken: accessToken, // ✅ now properly defined
          ),
        ),
      );
    } else {
      setState(() => error = 'Invalid credentials. Please try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Lottie.asset('assets/login_animation.json', height: 180),
              const SizedBox(height: 20),
              Text(
                'Entbysys Billing App',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 10),
              CustomTextField(
                hintText: 'Email',
                icon: Icons.email,
                controller: emailController,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                hintText: 'Password',
                icon: Icons.lock,
                obscureText: true,
                controller: passwordController,
              ),
              if (error != null) ...[
                const SizedBox(height: 12),
                Text(error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: isLoading ? null : handleLogin,
                icon: const Icon(Icons.login),
                label: Text(isLoading ? 'Logging in...' : 'Login'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  backgroundColor: Colors.blue,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}