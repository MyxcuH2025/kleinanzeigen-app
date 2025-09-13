export interface Listing {
  id?: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images?: string[]; // Array von Bild-URLs
}

export async function getListings(): Promise<Listing[]> {
  const res = await fetch("http://localhost:8000/api/listings");
  if (!res.ok) throw new Error("Fehler beim Laden der Listings");
  return res.json();
}

export async function createListing(listing: Omit<Listing, "id">): Promise<Listing> {
  // images als JSON-String senden
  const payload = { ...listing, images: JSON.stringify(listing.images ?? []) };
  const res = await fetch("http://localhost:8000/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Fehler beim Erstellen des Listings");
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`http://localhost:8000/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`http://localhost:8000/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { access_token, token_type }
}

// API Service für Vorlagen und andere Funktionen
export class ApiService {
  private baseUrl = 'http://localhost:8000';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async get<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
