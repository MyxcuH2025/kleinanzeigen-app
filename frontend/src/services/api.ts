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
  // TEMPORÄR DEAKTIVIERT: Backend-API-Aufruf
  console.log('Listings-API temporär deaktiviert');
  return [];
  
  /* ORIGINAL CODE DEAKTIVIERT
  const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/listings`);
  if (!res.ok) throw new Error("Fehler beim Laden der Listings");
  return res.json();
  */
}

export async function createListing(listing: Omit<Listing, "id">): Promise<Listing> {
  // TEMPORÄR DEAKTIVIERT: Backend-API-Aufruf
  console.log('Create Listing API temporär deaktiviert');
  return { ...listing, id: Math.random() };
  
  /* ORIGINAL CODE DEAKTIVIERT
  // REPARIERT: Bilder immer als Array senden, nie als JSON-String (verursacht "Image corrupt" Fehler)
  const images = listing.images ?? [];
  const payload = { 
    ...listing, 
    images: images // REPARIERT: Immer als Array senden, nie JSON.stringify()
  };
  
  // JWT-Token für User-Authentifizierung hinzufügen
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { "Content-Type": "application/json" };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/listings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Fehler beim Erstellen des Listings");
  return res.json();
  */
}

export async function register(email: string, password: string) {
  // TEMPORÄR DEAKTIVIERT: Backend-API-Aufruf
  console.log('Register API temporär deaktiviert');
  return { message: 'Registrierung temporär deaktiviert' };
  
  /* ORIGINAL CODE DEAKTIVIERT
  const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
  */
}

export async function login(email: string, password: string) {
  const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { access_token, token_type }
}

// API Service für Vorlagen und andere Funktionen
export class ApiService {
  private baseUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';

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
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    // Authorization Header hinzufügen
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Content-Type nur für JSON setzen, nicht für FormData
    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
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
