import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Support as SupportIcon,
  AccessTime as AccessTimeIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// FAQ Daten
const faqData = [
  {
    id: 'account',
    title: 'Konto & Registrierung',
    questions: [
      {
        question: 'Wie erstelle ich ein Konto?',
        answer: 'Klicken Sie auf "Registrieren" in der oberen rechten Ecke, geben Sie Ihre E-Mail-Adresse und ein sicheres Passwort ein. Bestätigen Sie Ihre E-Mail-Adresse über den Link, den wir Ihnen senden.',
        category: 'Registrierung',
        icon: <HelpIcon />
      },
      {
        question: 'Wie verifiziere ich mein Konto?',
        answer: 'Nach der Registrierung erhalten Sie eine E-Mail mit einem Bestätigungslink. Klicken Sie darauf, um Ihr Konto zu verifizieren. Sie können die E-Mail auch über Ihr Profil erneut senden.',
        category: 'Verifizierung',
        icon: <CheckCircleIcon />
      },
      {
        question: 'Was ist ein Verkäufer-Konto?',
        answer: 'Ein Verkäufer-Konto ermöglicht es Ihnen, Anzeigen zu erstellen und zu verwalten. Sie können zwischen privaten und gewerblichen Verkäufer-Konten wählen.',
        category: 'Konto-Typen',
        icon: <GroupIcon />
      }
    ]
  },
  {
    id: 'listings',
    title: 'Anzeigen erstellen & verwalten',
    questions: [
      {
        question: 'Wie erstelle ich eine Anzeige?',
        answer: 'Klicken Sie auf "Anzeige erstellen", wählen Sie die passende Kategorie, fügen Sie Titel, Beschreibung und Bilder hinzu. Geben Sie Preis und Standort an und veröffentlichen Sie Ihre Anzeige.',
        category: 'Erstellung',
        icon: <DescriptionIcon />
      },
      {
        question: 'Wie viele Bilder kann ich hochladen?',
        answer: 'Sie können bis zu 10 Bilder pro Anzeige hochladen. Das erste Bild wird als Hauptbild angezeigt. Wir empfehlen hochauflösende Bilder in guter Qualität.',
        category: 'Bilder',
        icon: <StarIcon />
      },
      {
        question: 'Wie bearbeite ich eine Anzeige?',
        answer: 'Gehen Sie zu "Meine Anzeigen" in Ihrem Profil, klicken Sie auf "Bearbeiten" bei der gewünschten Anzeige. Sie können alle Details ändern und die Anzeige erneut veröffentlichen.',
        category: 'Bearbeitung',
        icon: <SpeedIcon />
      },
      {
        question: 'Wie lösche ich eine Anzeige?',
        answer: 'In "Meine Anzeigen" finden Sie den "Löschen"-Button bei jeder Ihrer Anzeigen. Gelöschte Anzeigen können nicht wiederhergestellt werden.',
        category: 'Löschung',
        icon: <InfoIcon />
      }
    ]
  },
  {
    id: 'safety',
    title: 'Sicherheit & Bezahlung',
    questions: [
      {
        question: 'Wie sicher ist die Plattform?',
        answer: 'Wir verwenden SSL-Verschlüsselung und überprüfen alle Anzeigen. Melden Sie verdächtige Inhalte über den "Melden"-Button. Wir haben ein 24/7 Sicherheitsteam.',
        category: 'Sicherheit',
        icon: <SecurityIcon />
      },
      {
        question: 'Wie funktioniert die Bezahlung?',
        answer: 'Die Bezahlung erfolgt direkt zwischen Käufer und Verkäufer. Wir bieten keine Zahlungsabwicklung an, sondern vermitteln nur den Kontakt. Seien Sie vorsichtig bei Vorkasse.',
        category: 'Bezahlung',
        icon: <PaymentIcon />
      },
      {
        question: 'Was tun bei Problemen?',
        answer: 'Kontaktieren Sie uns sofort über das Kontaktformular oder per E-Mail. Bei Betrugsverdacht wenden Sie sich an die örtlichen Behörden und melden Sie den Fall bei uns.',
        category: 'Probleme',
        icon: <SupportIcon />
      }
    ]
  },
  {
    id: 'general',
    title: 'Allgemeine Fragen',
    questions: [
      {
        question: 'Wie funktioniert die Suche?',
        answer: 'Verwenden Sie die Suchleiste für Stichwörter, filtern Sie nach Kategorie, Preis und Standort. Speichern Sie Suchanfragen als Favoriten für wiederkehrende Suchen.',
        category: 'Suche',
        icon: <SearchIcon />
      },
      {
        question: 'Wie kontaktiere ich Verkäufer?',
        answer: 'Klicken Sie auf "Nachricht senden" bei einer Anzeige. Sie können über unsere sichere Chat-Funktion kommunizieren, ohne Ihre persönlichen Daten preiszugeben.',
        category: 'Kommunikation',
        icon: <QuestionAnswerIcon />
      },
      {
        question: 'Gibt es eine mobile App?',
        answer: 'Ja, unsere mobile App ist für iOS und Android verfügbar. Sie bietet alle Funktionen der Website und benachrichtigt Sie über neue Nachrichten und Favoriten.',
        category: 'Mobile',
        icon: <TrendingUpIcon />
      }
    ]
  }
];

interface FAQSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ searchQuery, onSearchChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 700, 
        color: theme.palette.primary.main,
        mb: 3,
        textAlign: 'center'
      }}>
        Häufig gestellte Fragen
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Fragen durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }
          }}
        />
      </Paper>

      {filteredData.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Keine Fragen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Versuchen Sie andere Suchbegriffe
          </Typography>
        </Paper>
      ) : (
        filteredData.map((category) => (
          <Box key={category.id} sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ 
              mb: 2, 
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {category.title}
            </Typography>
            
            {category.questions.map((faq, index) => (
              <Accordion 
                key={index} 
                elevation={1}
                sx={{ 
                  mb: 1, 
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '0 0 8px 0'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 2,
                    '&.Mui-expanded': {
                      borderRadius: '8px 8px 0 0'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ color: theme.palette.primary.main }}>
                      {faq.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
                      {faq.question}
                    </Typography>
                    <Chip 
                      label={faq.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
};
