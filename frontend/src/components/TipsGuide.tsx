import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  useTheme,
  Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  Shield as ShieldCheckIcon,
  Person as UserCheckIcon,
  Camera as CameraIcon,
  AttachMoney as BadgeDollarSignIcon,
  Phone as PhoneIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  Chat as MessageCircleIcon,
  Visibility as EyeIcon
} from "@mui/icons-material";

const tipsKaeufer = [
  {
    icon: <EyeIcon color="primary" />, title: "Beschreibung kritisch lesen",
    text: "Lies genau, ob die Beschreibung zum Titel passt. Widersprüche = Warnsignal. Fehlen Infos? Lieber nachfragen."
  },
  {
    icon: <UserCheckIcon color="primary" />, title: "Verkäuferprofil checken",
    text: "Achte auf Profilalter, Bewertungen, und andere aktive Anzeigen. Leere Profile vermeiden."
  },
  {
    icon: <SearchIcon color="primary" />, title: "Preis vergleichen",
    text: "Nutze andere Plattformen für einen fairen Preisvergleich. Zu günstig? Finger weg."
  },
  {
    icon: <ShieldCheckIcon color="primary" />, title: "Sichere Zahlungsmethoden",
    text: "Bevorzuge PayPal mit Käuferschutz. Keine Vorkasse oder anonyme Zahlmethoden."
  },
  {
    icon: <MapPinIcon color="primary" />, title: "Persönlich abholen",
    text: "Bei Abholung kannst du das Produkt direkt prüfen & sicher bezahlen."
  },
];

const tipsVerkaeufer = [
  {
    icon: <CameraIcon color="secondary" />, title: "Gute Fotos verwenden",
    text: "Nutze helles Licht & zeige mehrere Perspektiven. Ehrliche Darstellung schafft Vertrauen."
  },
  {
    icon: <MessageCircleIcon color="secondary" />, title: "Ehrliche Beschreibung schreiben",
    text: "Gib Marke, Zustand, Zubehör und Besonderheiten offen an. Ehrlichkeit spart Nachfragen."
  },
  {
    icon: <BadgeDollarSignIcon color="secondary" />, title: "Realistischen Preis setzen",
    text: "Informiere dich über ähnliche Angebote. Sei transparent & fair."
  },
  {
    icon: <PhoneIcon color="secondary" />, title: "Erreichbarkeit zeigen",
    text: "Zeig wie und wann man dich erreichen kann – z. B. per E-Mail oder WhatsApp."
  },
  {
    icon: <ClockIcon color="secondary" />, title: "Zur richtigen Zeit posten",
    text: "Sonntagabend oder werktags ab 18 Uhr bringen oft mehr Sichtbarkeit."
  },
];

const sicherheitstipps = [
  "Bleibe immer in der Plattform – keine Wechsel auf Telegram oder WhatsApp ohne Grund.",
  "Versende nichts, bevor du sicher bezahlt wurdest.",
  "Vertraue deinem Bauchgefühl – wenn etwas komisch wirkt, lieber abbrechen."
];

export default function TipsGuide() {
  const theme = useTheme();
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', py: { xs: 3, md: 6 }, px: { xs: 2, md: 0 } }}>
      {/* Hero-Header */}
      <Card sx={{ mb: 4, background: `linear-gradient(90deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`, color: '#fff', borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 56, height: 56, fontSize: 32 }}>🛍️</Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>Der perfekte Kleinanzeigen-Guide</Typography>
              <Typography variant="body1" sx={{ opacity: 0.92 }}>
                So erkennst du seriöse Angebote & erstellst Anzeigen, die wirklich verkaufen.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tipps für Käufer */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: theme.palette.primary.main }}>👤 Für Käufer</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
        {tipsKaeufer.map((tip, i) => (
          <Box key={i}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, color: '#fff', width: 40, height: 40 }}>
                    {tip.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>{tip.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{tip.text}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Tipps für Verkäufer */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: theme.palette.secondary.main }}>🧾 Für Verkäufer</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
        {tipsVerkaeufer.map((tip, i) => (
          <Box key={i}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: '#fff', width: 40, height: 40 }}>
                    {tip.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>{tip.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{tip.text}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Sicherheitstipps */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 5, mb: 2, color: theme.palette.success.main }}>🔐 Zusätzliche Sicherheitstipps</Typography>
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Stack spacing={1}>
            {sicherheitstipps.map((tipp, i) => (
              <Stack direction="row" spacing={1} alignItems="flex-start" key={i}>
                <Chip label="Tipp" color="success" size="small" sx={{ fontWeight: 600, minWidth: 60 }} />
                <Typography variant="body2" color="text.secondary">{tipp}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Kleinanzeigen. Alle Rechte vorbehalten.
      </Typography>
    </Box>
  );
} 