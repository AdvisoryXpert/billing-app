import 'package:flutter/material.dart';
import 'sidebar.dart';

class MainScaffold extends StatefulWidget {
  final Widget child;
  final String accessToken; // ✅ Added token parameter

  const MainScaffold({
    super.key,
    required this.child,
    required this.accessToken,
  });

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  late Widget currentScreen;

  @override
  void initState() {
    super.initState();
    currentScreen = widget.child;
  }

  void onItemSelected(Widget screen) {
    setState(() {
      currentScreen = screen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          Sidebar(
            onItemSelected: onItemSelected,
            accessToken: widget.accessToken, // ✅ Passed token here
          ),
          Expanded(
            child: Container(
              color: const Color.fromARGB(255, 245, 245, 245),
              padding: const EdgeInsets.all(20),
              child: currentScreen,
            ),
          ),
        ],
      ),
    );
  }
}
