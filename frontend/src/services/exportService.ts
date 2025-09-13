import { config, getFullApiUrl } from '@/config/config';

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    category?: string;
    role?: string;
  };
  includeHeaders?: boolean;
}

export const exportService = {
  // CSV Export Funktionen
  async exportUsersToCSV(options: ExportOptions = { format: 'csv' }): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl('api/admin/export/users')}?format=csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Export der User-Daten');
    }

    return await response.blob();
  },

  async exportListingsToCSV(options: ExportOptions = { format: 'csv' }): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl('api/admin/export/listings')}?format=csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Export der Anzeigen-Daten');
    }

    return await response.blob();
  },

  async exportReportsToCSV(options: ExportOptions = { format: 'csv' }): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl('api/admin/export/reports')}?format=csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Export der Report-Daten');
    }

    return await response.blob();
  },

  // PDF Export Funktionen
  async exportDashboardToPDF(): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl('api/admin/export/dashboard')}?format=pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Export des Dashboard-Berichts');
    }

    return await response.blob();
  },

  async exportAnalyticsToPDF(options: ExportOptions = { format: 'pdf' }): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl('api/admin/export/analytics')}?format=pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Export der Analytics-Daten');
    }

    return await response.blob();
  },

  // Excel Export Funktionen
  async exportToExcel(dataType: 'users' | 'listings' | 'reports', options: ExportOptions = { format: 'excel' }): Promise<Blob> {
    const response = await fetch(`${getFullApiUrl(`api/admin/export/${dataType}`)}?format=excel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Export der ${dataType}-Daten`);
    }

    return await response.blob();
  },

  // Hilfsfunktion zum Download
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Client-seitiger CSV Export (Fallback)
  exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      throw new Error('Keine Daten zum Exportieren vorhanden');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }
}; 
