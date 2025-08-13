import { api } from './http';

export type Client = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  state?: string | null;
  gstin?: string | null;
};

// READ
export async function listClients(): Promise<Client[]> {
  const { data } = await api.get('/clients');
  return data as Client[];
}

// CREATE
export async function createClient(payload: Omit<Client, 'id'>): Promise<Client> {
  const { data } = await api.post('/clients', payload);
  return data as Client;
}

// UPDATE
export async function updateClient(
  id: number,
  payload: Partial<Omit<Client, 'id'>>
): Promise<Client> {
  const { data } = await api.put(`/clients/${id}`, payload);
  return data as Client;
}

// DELETE
export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clients/${id}`);
}
