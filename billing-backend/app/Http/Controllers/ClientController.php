<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index() {
        return Client::all();
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
        ]);

        return Client::create($validated);
    }

    public function show($id) {
        return Client::findOrFail($id);
    }

 public function update(Request $request, $id)
{
    $client = Client::findOrFail($id);

    $validated = $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'email' => 'nullable|email|unique:clients,email,' . $client->id,
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:255',
        'company' => 'nullable|string|max:255',
    ]);

    $client->update($validated);

    return response()->json($client);
}

    public function destroy($id) {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
