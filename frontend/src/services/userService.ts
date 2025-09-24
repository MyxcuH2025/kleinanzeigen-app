export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  verification_state: string;
  verification_text: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  email_verified_at: string | null;
  seller_verified_at: string | null;
  location: string;
  phone: string;
  bio: string;
  website?: string;
}

export interface UsersResponse {
  users: User[];
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

const API_BASE_URL = 'http://localhost:8000/api'; // TEMP: Immer lokales Backend verwenden

export const userService = {
  // Alle User abrufen
  async getUsers(
    limit: number = 20,
    offset: number = 0,
    search?: string,
    verification_state?: string
  ): Promise<UsersResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (verification_state) {
      params.append('verification_state', verification_state);
    }

    const response = await fetch(`${API_BASE_URL}/users/public?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Einzelnen User abrufen
  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // User nach Verifizierungsstatus filtern
  async getUsersByVerificationState(state: string): Promise<User[]> {
    const response = await this.getUsers(100, 0, undefined, state);
    return response.users;
  },

  // Verifizierte Verkäufer abrufen
  async getVerifiedSellers(): Promise<User[]> {
    return await this.getUsersByVerificationState('SELLER_VERIFIED');
  },

  // E-Mail verifizierte User abrufen
  async getEmailVerifiedUsers(): Promise<User[]> {
    return await this.getUsersByVerificationState('EMAIL_VERIFIED');
  },

  // Avatar hochladen (für User ID)
  async uploadAvatar(userId: number, file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: form
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Avatar-Upload fehlgeschlagen');
    }
    const data = await res.json();
    return data.url as string;
  },

  // Aktuellen User abrufen
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Laden des Benutzerprofils');
    }
    
    return response.json();
  },

  // Profil aktualisieren
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren des Profils');
    }
    
    return response.json();
  },

  // Avatar hochladen (für Settings - aktueller User)
  async uploadAvatarForCurrentUser(formData: FormData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Hochladen des Avatars');
    }
    
    return response.json();
  },

  // Passwort ändern
  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Ändern des Passworts');
    }
  },

  // Account löschen
  async deleteAccount(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Löschen des Accounts');
    }
  }
};
