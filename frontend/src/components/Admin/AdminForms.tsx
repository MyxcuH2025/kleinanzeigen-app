import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  DynamicForm as DynamicIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Schema as SchemaIcon,
  Code as CodeIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

interface DynamicForm {
  id: number;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

interface AdminFormsProps {
  forms: DynamicForm[];
  loading: boolean;
  onRefreshForms: () => void;
  onExportForms: (format: 'csv' | 'excel' | 'json') => void;
  onImportForms: (file: File) => void;
  onCreateForm: (form: Omit<DynamicForm, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onUpdateForm: (id: number, form: Partial<DynamicForm>) => void;
  onDeleteForm: (id: number) => void;
  onToggleFormStatus: (id: number, isActive: boolean) => void;
  onPreviewForm: (id: number) => void;
  onTestForm: (id: number) => void;
}

export const AdminForms: React.FC<AdminFormsProps> = ({
  forms,
  loading,
  onRefreshForms,
  onExportForms,
  onImportForms,
  onCreateForm,
  onUpdateForm,
  onDeleteForm,
  onToggleFormStatus,
  onPreviewForm,
  onTestForm
}) => {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<DynamicForm | null>(null);
  const [formData, setFormData] = useState<Partial<DynamicForm>>({});
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleCreateForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      fields: [],
      isActive: true
    });
    setCreateDialog(true);
  };

  const handleEditForm = (form: DynamicForm) => {
    setSelectedForm(form);
    setFormData(form);
    setEditDialog(true);
  };

  const handlePreviewForm = (form: DynamicForm) => {
    setSelectedForm(form);
    setPreviewDialog(true);
  };

  const handleSaveForm = () => {
    if (selectedForm) {
      onUpdateForm(selectedForm.id, formData);
    } else {
      onCreateForm(formData as Omit<DynamicForm, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>);
    }
    setCreateDialog(false);
    setEditDialog(false);
    setFormData({});
    setSelectedForm(null);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportForms = () => {
    if (importFile) {
      onImportForms(importFile);
      setImportDialog(false);
      setImportFile(null);
    }
  };

  const formCategories = [
    'Elektronik',
    'Fahrzeuge',
    'Immobilien',
    'Mode & Beauty',
    'Sport & Freizeit',
    'Haus & Garten',
    'Tiere',
    'Dienstleistungen',
    'Sonstiges'
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Zahl' },
    { value: 'select', label: 'Auswahl' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Textbereich' },
    { value: 'date', label: 'Datum' },
    { value: 'file', label: 'Datei' }
  ];

  const renderFormField = (field: FormField, index: number) => (
    <Card key={field.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {field.name} ({field.type})
        </Typography>
        <Box>
          <Tooltip title="Bearbeiten">
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Löschen">
            <IconButton size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={field.required ? 'Pflichtfeld' : 'Optional'} 
          color={field.required ? 'error' : 'default'} 
          size="small" 
        />
        {field.options && (
          <Chip 
            label={`${field.options.length} Optionen`} 
            color="info" 
            size="small" 
          />
        )}
        {field.validation && (
          <Chip 
            label="Validierung" 
            color="warning" 
            size="small" 
          />
        )}
      </Box>
    </Card>
  );

  return (
    <Box>
      {/* Header mit Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Dynamische Formulare</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setImportDialog(true)}
            startIcon={<UploadIcon />}
          >
            Importieren
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportForms('json')}
            startIcon={<DownloadIcon />}
          >
            Exportieren
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateForm}
            startIcon={<AddIcon />}
          >
            Neues Formular
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onRefreshForms}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            {loading ? 'Lädt...' : 'Aktualisieren'}
          </Button>
        </Box>
      </Box>

      {/* Forms Overview Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Box>
          <Card sx={{ backgroundColor: '#e8f5e8' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.dark">
                    {forms.filter(f => f.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Aktive Formulare</Typography>
                </Box>
                <CategoryIcon color="success" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.dark">
                    {forms.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Gesamt Formulare</Typography>
                </Box>
                <DynamicIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="info.dark">
                    {forms.reduce((sum, form) => sum + form.usageCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Verwendungen</Typography>
                </Box>
                <AssignmentIcon color="info" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ backgroundColor: '#f3e5f5' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.dark">
                    {formCategories.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Kategorien</Typography>
                </Box>
                <SchemaIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Forms List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Formulare verwalten</Typography>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">Lade Formulare...</Typography>
            </Box>
          ) : forms.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Keine Formulare vorhanden
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateForm}
                startIcon={<AddIcon />}
              >
                Erstes Formular erstellen
              </Button>
            </Box>
          ) : (
            <List>
              {forms.map((form, index) => (
                <React.Fragment key={form.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <DynamicIcon color={form.isActive ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {form.name}
                          </Typography>
                          <Chip 
                            label={form.isActive ? 'Aktiv' : 'Inaktiv'} 
                            color={form.isActive ? 'success' : 'default'} 
                            size="small" 
                          />
                          <Chip 
                            label={form.category} 
                            color="info" 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {form.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`${form.fields.length} Felder`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${form.usageCount} Verwendungen`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Typography variant="caption" color="text.secondary">
                              Erstellt: {new Date(form.createdAt).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Vorschau">
                        <IconButton 
                          size="small"
                          onClick={() => handlePreviewForm(form)}
                        >
                          <PreviewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Testen">
                        <IconButton 
                          size="small"
                          onClick={() => onTestForm(form.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bearbeiten">
                        <IconButton 
                          size="small"
                          onClick={() => handleEditForm(form)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Status ändern">
                        <IconButton 
                          size="small"
                          onClick={() => onToggleFormStatus(form.id, !form.isActive)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onDeleteForm(form.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < forms.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={createDialog || editDialog} onClose={() => {
        setCreateDialog(false);
        setEditDialog(false);
        setFormData({});
        setSelectedForm(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedForm ? 'Formular bearbeiten' : 'Neues Formular erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Formular Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Kategorie</InputLabel>
                  <Select
                    value={formData.category || ''}
                    label="Kategorie"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {formCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Formular ist aktiv"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false);
            setEditDialog(false);
            setFormData({});
            setSelectedForm(null);
          }}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveForm} variant="contained">
            {selectedForm ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Form Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Formular Vorschau: {selectedForm?.name}
        </DialogTitle>
        <DialogContent>
          {selectedForm && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Vorschau des Formulars "{selectedForm.name}" für die Kategorie "{selectedForm.category}"
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedForm.description}
              </Typography>
              <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
                {selectedForm.fields.map((field, index) => (
                  <Box key={field.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {field.name} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    {field.type === 'text' && (
                      <TextField
                        fullWidth
                        placeholder={field.placeholder || `Geben Sie ${field.name} ein`}
                        size="small"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder={field.placeholder || `Geben Sie ${field.name} ein`}
                        size="small"
                      />
                    )}
                    {field.type === 'select' && (
                      <FormControl fullWidth size="small">
                        <InputLabel>{field.name}</InputLabel>
                        <Select label={field.name}>
                          {field.options?.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {field.type === 'checkbox' && (
                      <FormControlLabel
                        control={<Switch />}
                        label={field.name}
                      />
                    )}
                    {field.type === 'number' && (
                      <TextField
                        fullWidth
                        type="number"
                        placeholder={field.placeholder || `Geben Sie ${field.name} ein`}
                        size="small"
                      />
                    )}
                    {field.type === 'date' && (
                      <TextField
                        fullWidth
                        type="date"
                        size="small"
                      />
                    )}
                    {field.type === 'file' && (
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        size="small"
                      >
                        Datei auswählen
                        <input type="file" hidden />
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Schließen</Button>
          <Button onClick={() => selectedForm && onTestForm(selectedForm.id)} variant="contained">
            Formular testen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Formulare importieren</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Wählen Sie eine JSON-Datei mit Formulardefinitionen aus.
            </Alert>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Datei auswählen
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportFile}
              />
            </Button>
            {importFile && (
              <Alert severity="success">
                Ausgewählte Datei: {importFile.name}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={handleImportForms} 
            variant="contained"
            disabled={!importFile}
          >
            Importieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
