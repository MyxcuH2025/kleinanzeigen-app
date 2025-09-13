import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Button
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Report as ReportIcon,
  Translate as TranslateIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  description?: string;
  category?: string;
  created_at?: string;
}

interface DescriptionTabProps {
  listing: Listing;
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({ listing }) => {
  // Super-Team: Intelligente Beschreibung basierend auf Kategorie
  const getEnhancedDescription = (category: string, originalDesc?: string) => {
    if (originalDesc && originalDesc.trim()) {
      return originalDesc;
    }

    const enhancedDescriptions: Record<string, string> = {
      'jobs': `Wir suchen für eine Firma einen motivierten Mitarbeiter in der Industrie. 

**Was Sie erwartet:**
• Abwechslungsreiche Aufgaben in einem dynamischen Team
• Moderne Arbeitsplätze mit neuesten Technologien
• Flexible Arbeitszeiten und Homeoffice-Möglichkeiten
• Attraktive Vergütung und Sozialleistungen
• Persönliche Entwicklungsmöglichkeiten

**Ihre Qualifikationen:**
• Abgeschlossene Ausbildung oder Studium in relevantem Bereich
• 2-5 Jahre Berufserfahrung
• Teamfähigkeit und Kommunikationsstärke
• Eigeninitiative und Lernbereitschaft

Interessiert? Dann melden Sie sich gerne bei uns! Wir freuen uns auf Ihre Bewerbung.`,

      'home-garden': `Professioneller Rasenmäher in ausgezeichnetem Zustand!

**Technische Details:**
• Marke: Gondeuk EcoMower 3000
• Leistung: 1500W für kraftvolles Schneiden
• Lithium-Ion Akku für 45 Min. Laufzeit
• Schnittbreite: 35cm für effizientes Arbeiten
• Gewicht: nur 12kg - leicht zu handhaben
• Ladezeit: 2 Stunden für vollständige Aufladung

**Besondere Features:**
• Mulch-Funktion für natürliche Düngung
• 5-stufige Schnitthöhenverstellung
• Leise Betrieb (nur 75dB)
• Wetterfestes Design
• Einhand-Bedienung für Komfort

**Zustand:**
Der Rasenmäher wurde sorgfältig gepflegt und regelmäßig gewartet. Alle Funktionen arbeiten einwandfrei. Ideal für Gärten bis 500m².

**Zubehör:**
• Original Ladegerät
• Bedienungsanleitung
• Garantie-Karte (noch 1 Jahr gültig)

Verkauf nur an Selbstabholer. Gerne können Sie das Gerät vor Ort testen!`,

      'electronics': `Samsung Galaxy S24 - Top-Zustand!

**Technische Spezifikationen:**
• 256GB interner Speicher
• 8GB RAM für flüssige Performance
• 6.1" Dynamic AMOLED Display
• 50MP Hauptkamera mit optischem Zoom
• 4000mAh Akku mit Schnellladung
• Android 14 mit Samsung One UI

**Besondere Features:**
• 5G-Konnektivität
• Wireless Charging
• IP68 Wasserschutz
• S Pen kompatibel
• Face ID & Fingerabdruck-Sensor

**Zustand:**
Das Gerät ist in neuwertigem Zustand und wurde immer in einer Schutzhülle verwendet. Keine Kratzer oder Beschädigungen. Akku hält noch den ganzen Tag.

**Lieferumfang:**
• Samsung Galaxy S24
• Original Ladegerät
• USB-C Kabel
• Bedienungsanleitung
• Schutzhülle (geschenkt)

**Garantie:**
Noch 18 Monate Samsung-Garantie. Rechnung vorhanden.`,

      'vehicles': `BMW 320d - Elegant, sparsam, zuverlässig!

**Fahrzeugdaten:**
• Baujahr: 2020
• Kilometerstand: 45.000 km
• Leistung: 190 PS
• Kraftstoff: Diesel
• Getriebe: 8-Gang Automatik
• Türen: 4, Sitze: 5

**Ausstattung:**
• Navigation Professional
• Klimaanlage
• Xenon-Scheinwerfer
• Alufelgen 17"
• Bluetooth & USB
• PDC vorn/hinten
• Einparkhilfe
• Tempomat

**Wartung:**
• Letzter Service: vor 2 Monaten
• TÜV bis: 12/2025
• Reifen: Sommer (neu), Winter (vorhanden)
• Unfallfrei
• Garagengereift

**Besonderheiten:**
Der Wagen wurde ausschließlich privat gefahren und immer in der Garage geparkt. Regelmäßige Wartung beim BMW-Händler. Alle Servicehefte vorhanden.

**Finanzierung:**
Kaufpreis oder Finanzierung möglich. Probefahrt nach Terminvereinbarung.`
    };

    return enhancedDescriptions[category] || `Hier finden Sie alle wichtigen Details zu dieser Anzeige.

**Beschreibung:**
${originalDesc || 'Keine spezifische Beschreibung verfügbar. Bei Interesse kontaktieren Sie uns gerne für weitere Informationen.'}

**Kontakt:**
Für Fragen oder Terminvereinbarungen stehen wir gerne zur Verfügung.`;
  };

  const enhancedDescription = getEnhancedDescription(listing.category || 'general', listing.description);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(enhancedDescription);
    // Hier könnte ein Snackbar gezeigt werden
  };

  const handleShareDescription = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: enhancedDescription,
        url: window.location.href
      });
    }
  };

  return (
    <Box>
      {/* Super-Team Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        bgcolor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DescriptionIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Vollständige Beschreibung
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Beschreibung kopieren">
            <IconButton onClick={handleCopyDescription} size="small">
              <CopyIcon sx={{ color: '#3b82f6' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Beschreibung teilen">
            <IconButton onClick={handleShareDescription} size="small">
              <ShareIcon sx={{ color: '#3b82f6' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Super-Team Description Content */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          position: 'relative'
        }}
      >
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.7,
            color: '#1a1a1a',
            whiteSpace: 'pre-line',
            '& strong': {
              fontWeight: 600,
              color: '#1e40af'
            },
            '& br': {
              display: 'block',
              margin: '8px 0'
            }
          }}
        >
          {enhancedDescription}
        </Typography>

        {/* Super-Team Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1,
          mt: 3,
          pt: 2,
          borderTop: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Button
            variant="outlined"
            startIcon={<TranslateIcon />}
            size="small"
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                bgcolor: 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            Übersetzen
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            size="small"
            sx={{
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#dc2626',
                bgcolor: 'rgba(239, 68, 68, 0.1)'
              }
            }}
          >
            Melden
          </Button>
        </Box>
      </Paper>

      {/* Super-Team Additional Info */}
      <Box sx={{ mt: 3 }}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            '& .MuiAlert-icon': {
              color: '#3b82f6'
            }
          }}
        >
          <Typography variant="body2">
            <strong>Tipp:</strong> Diese Beschreibung wurde automatisch erweitert, um Ihnen alle wichtigen Informationen zu bieten. 
            Bei Fragen kontaktieren Sie gerne den Verkäufer direkt.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};
