import { config, getFullApiUrl } from '@/config/config';
import type { ReportReason } from '@/components/ReportDialog';

export const reportService = {
  async reportListing(listingId: string, reason: ReportReason, description: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');
    
    const response = await fetch(getFullApiUrl(`api/report/${listingId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reason,
        description
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Fehler beim Melden der Anzeige');
    }
  },

  async getReports(status?: string, page: number = 1, limit: number = 20): Promise<unknown> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await fetch(getFullApiUrl(`api/reports?${params}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Fehler beim Laden der Reports');
    }

    return response.json();
  },

  async updateReportStatus(reportId: string, status: string, adminNotes?: string): Promise<unknown> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');
    
    const response = await fetch(getFullApiUrl(`api/reports/${reportId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status,
        admin_notes: adminNotes
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Fehler beim Aktualisieren des Report-Status');
    }

    return response.json();
  }
}; 
