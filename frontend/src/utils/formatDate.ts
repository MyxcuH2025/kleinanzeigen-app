export const formatDate = (date: Date | string): string => {
  try {
    // Wenn es ein String ist, konvertiere es zu einem Date-Objekt
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Prüfe, ob das Datum gültig ist
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Datum nicht verfügbar';
    }
    
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Datum nicht verfügbar';
  }
}; 
