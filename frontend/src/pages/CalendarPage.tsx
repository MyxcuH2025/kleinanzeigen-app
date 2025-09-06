import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'listing' | 'renewal' | 'promotion' | 'reminder';
  date: string;
  time?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  description: string;
  listingId?: string;
  listingTitle?: string;
}

export const CalendarPage: React.FC = () => {
  const [addEventDialog, setAddEventDialog] = useState(false);

  // Mock-Daten für Kalender-Events
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Anzeige verlängern',
      type: 'renewal',
      date: '2024-01-20',
      time: '09:00',
      status: 'scheduled',
      description: 'iPhone X Anzeige verlängern',
      listingId: '1',
      listingTitle: 'iPhone X/10 64GB'
    },
    {
      id: '2',
      title: 'Promotion starten',
      type: 'promotion',
      date: '2024-01-22',
      time: '14:00',
      status: 'scheduled',
      description: 'Mercedes S500 Promotion aktivieren',
      listingId: '2',
      listingTitle: 'Mercedes S500 Lang'
    },
    {
      id: '3',
      title: 'Preis anpassen',
      type: 'reminder',
      date: '2024-01-25',
      status: 'scheduled',
      description: 'BMW 320d Preis überprüfen',
      listingId: '3',
      listingTitle: 'BMW 320d'
    },
    {
      id: '4',
      title: 'Neue Anzeige erstellen',
      type: 'listing',
      date: '2024-01-28',
      time: '10:00',
      status: 'scheduled',
      description: 'MacBook Pro Anzeige erstellen'
    }
  ];

  // Stats-Daten für die Übersicht
  const stats = [
    {
      title: 'Anstehende Events',
      value: '12',
      change: '+3 diese Woche',
      color: '#1976d2',
      icon: <EventIcon />
    },
    {
      title: 'Abgeschlossene',
      value: '45',
      change: '+8 diesen Monat',
      color: '#2e7d32',
      icon: <ScheduleIcon />
    },
    {
      title: 'Promotionen',
      value: '8',
      change: '+2 diese Woche',
      color: '#ed6c02',
      icon: <TrendingUpIcon />
    },
    {
      title: 'Erinnerungen',
      value: '3',
      change: 'Heute',
      color: '#d32f2f',
      icon: <VisibilityIcon />
    }
  ];

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'listing': return '#FF6B35';
      case 'renewal': return '#4ECDC4';
      case 'promotion': return '#45B7D1';
      case 'reminder': return '#96CEB4';
      default: return '#666';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'listing': return <AddIcon />;
      case 'renewal': return <TrendingUpIcon />;
      case 'promotion': return <StarIcon />;
      case 'reminder': return <ScheduleIcon />;
      default: return <EventIcon />;
    }
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled': return 'Geplant';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  // Gruppiere Events nach Datum
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', color: 'text.primary' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Anzeigenplanung & Kalender
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddEventDialog(true)}
              sx={{
                bgcolor: 'warning.main',
                '&:hover': {
                  bgcolor: 'warning.dark'
                }
              }}
            >
              Event hinzufügen
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Plane und verwalte deine Anzeigen-Aktivitäten
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: { xs: 3, sm: 4 } 
        }}>
          {[...Array(4)].map((_, index) => (
            <Box key={index}>
              <Card sx={{
                height: { xs: '120px', sm: '140px' },
                bgcolor: 'background.paper',
                borderRadius: { xs: '8px', sm: '12px' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                      width: { xs: 24, sm: 32 },
                      height: { xs: 24, sm: 32 },
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Quick Action {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                    Beschreibung für diese Aktion
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Calendar View */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Card sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
                  Anstehende Events
                </Typography>
                
                {sortedDates.map((date) => (
                  <Box key={date} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
                      {new Date(date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    
                    <List sx={{ p: 0 }}>
                      {eventsByDate[date].map((event, index) => (
                        <React.Fragment key={event.id}>
                          <ListItem sx={{ 
                            p: 2, 
                            mb: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 2,
                            border: `2px solid ${getEventColor(event.type)}`,
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}>
                            <ListItemIcon>
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: 1, 
                                bgcolor: getEventColor(event.type), 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {getEventIcon(event.type)}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {event.title}
                                  </Typography>
                                  <Chip 
                                    label={getStatusText(event.status)} 
                                    size="small" 
                                    color={getStatusColor(event.status) as any}
                                  />
                                  {event.time && (
                                    <Chip 
                                      label={event.time} 
                                      size="small" 
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {event.description}
                                  </Typography>
                                  {event.listingTitle && (
                                    <Chip 
                                      label={event.listingTitle} 
                                      size="small" 
                                      sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} 
                                    />
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small">
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton size="small">
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < eventsByDate[date].length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
          
          <Box>
            <Card sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 2,
              height: 'fit-content'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
                  Schnellaktionen
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Neue Anzeige planen
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Verlängerung planen
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<StarIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Promotion planen
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Erinnerung erstellen
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
                  Nächste Events
                </Typography>
                
                <List sx={{ p: 0 }}>
                  {events
                    .filter(e => e.status === 'scheduled')
                    .slice(0, 3)
                    .map((event) => (
                      <ListItem key={event.id} sx={{ p: 0, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: getEventColor(event.type) 
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                              {event.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(event.date).toLocaleDateString('de-DE')}
                              {event.time && ` um ${event.time}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Add Event Dialog */}
        <Dialog open={addEventDialog} onClose={() => setAddEventDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Event hinzufügen</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  fullWidth
                  label="Event-Titel"
                  placeholder="z.B. Anzeige verlängern"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Datum"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Zeit (optional)"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <FormControl fullWidth>
                  <InputLabel>Event-Typ</InputLabel>
                  <Select label="Event-Typ">
                    <MenuItem value="listing">Neue Anzeige</MenuItem>
                    <MenuItem value="renewal">Verlängerung</MenuItem>
                    <MenuItem value="promotion">Promotion</MenuItem>
                    <MenuItem value="reminder">Erinnerung</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  multiline
                  rows={3}
                  placeholder="Beschreibung des Events..."
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddEventDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="contained"
              onClick={() => setAddEventDialog(false)}
              sx={{
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B'
                }
              }}
            >
              Event erstellen
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}; 