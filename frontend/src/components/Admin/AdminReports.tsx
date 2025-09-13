import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  Report as ReportIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface Report {
  id: number;
  listing_id: number;
  listing_title: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  reporter_email: string;
  reporter_name?: string;
  created_at: string;
  updated_at: string;
  response_time?: number;
  admin_notes?: string;
}

interface ReportFilters {
  status: string;
  priority: string;
  dateRange: string;
  search: string;
}

interface AdminReportsProps {
  reports: Report[];
  loading: boolean;
  onReportFilterChange: (field: string, value: string) => void;
  onReportAction: (reportId: number, action: string) => void;
  onExportReports: (format: 'csv' | 'excel') => void;
  onBulkAction: (action: string) => void;
  onTemplateAction: (template: string) => void;
  reportFilters: ReportFilters;
  selectedReports: number[];
  setSelectedReports: (reports: number[]) => void;
  reportDetailsDialog: boolean;
  setReportDetailsDialog: (open: boolean) => void;
  selectedReport: Report | null;
  reportAction: string;
  setReportAction: (action: string) => void;
  reportNotes: string;
  setReportNotes: (notes: string) => void;
  bulkActionDialog: boolean;
  setBulkActionDialog: (open: boolean) => void;
  bulkAction: string;
  setBulkAction: (action: string) => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  reports,
  loading,
  onReportFilterChange,
  onReportAction,
  onExportReports,
  onBulkAction,
  onTemplateAction,
  reportFilters,
  selectedReports,
  setSelectedReports,
  reportDetailsDialog,
  setReportDetailsDialog,
  selectedReport,
  reportAction,
  setReportAction,
  reportNotes,
  setReportNotes,
  bulkActionDialog,
  setBulkActionDialog,
  bulkAction,
  setBulkAction
}) => {
  // Filtered reports based on current filters
  const filteredReports = reports.filter(report => {
    const matchesStatus = !reportFilters.status || report.status === reportFilters.status;
    const matchesPriority = !reportFilters.priority || report.priority === reportFilters.priority;
    const matchesSearch = !reportFilters.search || 
      report.listing_title?.toLowerCase().includes(reportFilters.search.toLowerCase()) ||
      report.reporter_email?.toLowerCase().includes(reportFilters.search.toLowerCase()) ||
      report.reason?.toLowerCase().includes(reportFilters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: number, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'investigating': return 'info';
      case 'resolved': return 'success';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Offen';
      case 'investigating': return 'In Bearbeitung';
      case 'resolved': return 'Gelöst';
      case 'dismissed': return 'Abgelehnt';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Spam': return 'error';
      case 'Betrug': return 'error';
      case 'Unangemessen': return 'warning';
      default: return 'default';
    }
  };

  const reportTemplates = [
    { id: 'spam_confirm', label: 'Spam bestätigen', icon: <CheckIcon />, color: 'error' },
    { id: 'fraud_confirm', label: 'Betrug bestätigen', icon: <CheckIcon />, color: 'error' },
    { id: 'inappropriate_confirm', label: 'Unangemessen bestätigen', icon: <CheckIcon />, color: 'warning' },
    { id: 'false_report', label: 'Falscher Report', icon: <BlockIcon />, color: 'default' },
    { id: 'unfounded', label: 'Unbegründet', icon: <BlockIcon />, color: 'default' },
    { id: 'duplicate', label: 'Duplikat', icon: <AssignmentIcon />, color: 'info' }
  ];

  return (
    <Box>
      {/* Header mit Export-Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Reports Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportReports('csv')}
            startIcon={<DownloadIcon />}
          >
            CSV Export
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportReports('excel')}
            startIcon={<DownloadIcon />}
          >
            Excel Export
          </Button>
          {selectedReports.length > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setBulkActionDialog(true)}
              startIcon={<EditIcon />}
              color="warning"
            >
              Bulk-Aktionen ({selectedReports.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Reports Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="warning.dark">8</Typography>
                <Typography variant="body2" color="text.secondary">Offen</Typography>
              </Box>
              <WarningIcon color="warning" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#ffebee' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="error.dark">3</Typography>
                <Typography variant="body2" color="text.secondary">Hoch</Typography>
              </Box>
              <ReportIcon color="error" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#e8f5e8' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="success.dark">24</Typography>
                <Typography variant="body2" color="text.secondary">Gelöst</Typography>
              </Box>
              <CheckIcon color="success" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="primary.dark">2.3h</Typography>
                <Typography variant="body2" color="text.secondary">Ø Response</Typography>
              </Box>
              <SpeedIcon color="primary" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Erweiterte Filter */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={reportFilters.status}
            label="Status"
            onChange={(e) => onReportFilterChange('status', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="pending">Offen</MenuItem>
            <MenuItem value="investigating">In Bearbeitung</MenuItem>
            <MenuItem value="resolved">Gelöst</MenuItem>
            <MenuItem value="dismissed">Abgelehnt</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Priorität</InputLabel>
          <Select
            value={reportFilters.priority}
            label="Priorität"
            onChange={(e) => onReportFilterChange('priority', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="high">Hoch</MenuItem>
            <MenuItem value="medium">Mittel</MenuItem>
            <MenuItem value="low">Niedrig</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Zeitraum</InputLabel>
          <Select
            value={reportFilters.dateRange}
            label="Zeitraum"
            onChange={(e) => onReportFilterChange('dateRange', e.target.value)}
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="today">Heute</MenuItem>
            <MenuItem value="week">Diese Woche</MenuItem>
            <MenuItem value="month">Dieser Monat</MenuItem>
            <MenuItem value="3months">Letzte 3 Monate</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Report suchen"
          size="small"
          placeholder="Anzeige, User, Grund..."
          value={reportFilters.search}
          onChange={(e) => onReportFilterChange('search', e.target.value)}
        />
        <Button variant="contained" onClick={() => window.location.reload()}>
          Aktualisieren
        </Button>
      </Box>

      {/* Reports Tabelle */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  indeterminate={selectedReports.length > 0 && selectedReports.length < filteredReports.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Anzeige</TableCell>
              <TableCell>Grund</TableCell>
              <TableCell>Priorität</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Melder</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Response-Zeit</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onChange={(e) => handleSelectReport(report.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    #{report.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 50, 
                      height: 35, 
                      backgroundColor: 'grey.200', 
                      borderRadius: 1, 
                      mr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CategoryIcon color="action" fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.listing_title || 'Gelöschte Anzeige'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {report.listing_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={report.reason} 
                    size="small"
                    color={getReasonColor(report.reason) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={report.priority || 'Mittel'}
                    size="small"
                    color={getPriorityColor(report.priority || 'medium') as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(report.status)} 
                    color={getStatusColor(report.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {report.reporter_email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.reporter_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(report.created_at).toLocaleDateString('de-DE')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {report.response_time ? `${report.response_time}h` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Als gelöst markieren">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => onReportAction(report.id, 'resolve')}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ablehnen">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onReportAction(report.id, 'dismiss')}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="In Bearbeitung">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => onReportAction(report.id, 'investigate')}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Details anzeigen">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedReports([report.id]);
                          setReportDetailsDialog(true);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Report Templates */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Report-Templates</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            {reportTemplates.map((template) => (
              <Box key={template.id}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={template.icon}
                  onClick={() => onTemplateAction(template.id)}
                  color={template.color as any}
                  fullWidth
                >
                  {template.label}
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={reportDetailsDialog} onClose={() => setReportDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Report Details #{selectedReport?.id}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Anzeige</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedReport.listing_title || 'Gelöschte Anzeige'} (ID: {selectedReport.listing_id})
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Grund</Typography>
                  <Chip 
                    label={selectedReport.reason} 
                    color={getReasonColor(selectedReport.reason) as any}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>Beschreibung</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedReport.description || 'Keine Beschreibung verfügbar'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Melder</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedReport.reporter_email}
                    {selectedReport.reporter_name && ` (${selectedReport.reporter_name})`}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Status</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={getStatusLabel(selectedReport.status)} 
                      color={getStatusColor(selectedReport.status) as any}
                      size="small"
                    />
                    <Chip 
                      label={selectedReport.priority || 'Mittel'}
                      color={getPriorityColor(selectedReport.priority || 'medium') as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Zeitstempel</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Erstellt: {new Date(selectedReport.created_at).toLocaleString('de-DE')}
                    {selectedReport.updated_at && (
                      <><br />Aktualisiert: {new Date(selectedReport.updated_at).toLocaleString('de-DE')}</>
                    )}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Admin-Notizen</Typography>
              <MuiTextField
                fullWidth
                multiline
                rows={3}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Notizen zum Report..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDetailsDialog(false)}>Schließen</Button>
          <Button 
            onClick={() => {
              onReportAction(selectedReport?.id || 0, reportAction);
              setReportDetailsDialog(false);
            }} 
            variant="contained"
          >
            Aktion ausführen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk-Aktionen für {selectedReports.length} Reports
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Aktion</InputLabel>
              <Select
                value={bulkAction}
                label="Aktion"
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <MenuItem value="resolve">Alle als gelöst markieren</MenuItem>
                <MenuItem value="dismiss">Alle ablehnen</MenuItem>
                <MenuItem value="investigate">Alle in Bearbeitung setzen</MenuItem>
                <MenuItem value="assign">Alle zuweisen</MenuItem>
                <MenuItem value="delete">Alle löschen</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedReports.length} Reports werden bearbeitet
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={() => {
              onBulkAction(bulkAction);
              setBulkActionDialog(false);
            }} 
            variant="contained"
            color={bulkAction === 'dismiss' || bulkAction === 'delete' ? 'error' : 'primary'}
          >
            Ausführen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
