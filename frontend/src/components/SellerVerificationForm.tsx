import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DocumentIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface VerificationFormData {
  verification_type: 'shop' | 'service';
  company_name: string;
  tax_id: string;
  documents: File[];
  document_types: string[];
}

interface SellerVerificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SellerVerificationForm: React.FC<SellerVerificationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<VerificationFormData>({
    verification_type: 'shop',
    company_name: '',
    tax_id: '',
    documents: [],
    document_types: []
  });

  const steps = [
    {
      label: 'Verifizierungstyp wählen',
      description: 'Wählen Sie aus, ob Sie ein Geschäft oder ein Dienstleister sind.'
    },
    {
      label: 'Unternehmensdaten',
      description: 'Geben Sie die grundlegenden Informationen zu Ihrem Unternehmen ein.'
    },
    {
      label: 'Dokumente hochladen',
      description: 'Laden Sie die erforderlichen Nachweisdokumente hoch.'
    },
    {
      label: 'Antrag einreichen',
      description: 'Überprüfen Sie alle Angaben und reichen Sie Ihren Antrag ein.'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleVerificationTypeChange = (type: 'shop' | 'service') => {
    setFormData(prev => ({ ...prev, verification_type: type }));
  };

  const handleCompanyNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, company_name: name }));
  };

  const handleTaxIdChange = (taxId: string) => {
    setFormData(prev => ({ ...prev, tax_id: taxId }));
  };

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles],
        document_types: [...prev.document_types, ...newFiles.map(() => 'other')]
      }));
    }
  };

  const handleDocumentTypeChange = (index: number, type: string) => {
    setFormData(prev => ({
      ...prev,
      document_types: prev.document_types.map((t, i) => i === index ? type : t)
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      document_types: prev.document_types.filter((_, i) => i !== index)
    }));
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return formData.verification_type === 'shop' || formData.verification_type === 'service';
      case 1:
        return formData.company_name.trim() !== '' && formData.tax_id.trim() !== '';
      case 2:
        return formData.documents.length > 0;
      default:
        return true;
    }
  };

  const submitVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('verification_type', formData.verification_type);
      formDataToSend.append('company_name', formData.company_name);
      formDataToSend.append('tax_id', formData.tax_id);
      
      formData.documents.forEach((doc, index) => {
        formDataToSend.append('documents', doc);
        formDataToSend.append('document_types', formData.document_types[index]);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/seller/verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Fehler beim Einreichen der Verifizierung');
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckIcon sx={{ fontSize: 64, color: '#28a745', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: '#28a745' }}>
            Verifizierungsantrag erfolgreich eingereicht!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ihr Antrag wird von unserem Team geprüft. Sie erhalten eine Benachrichtigung, 
            sobald eine Entscheidung getroffen wurde.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ bgcolor: '#28a745' }}
          >
            Zurück zur Übersicht
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Verkäufer-Verifizierung
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Werden Sie ein verifizierter Verkäufer und genießen Sie das Vertrauen unserer Community
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 3 ? (
                    <Typography variant="caption" color="success.main">
                      Letzter Schritt
                    </Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography sx={{ mb: 2 }}>{step.description}</Typography>
                
                {/* Step 0: Verifizierungstyp */}
                {index === 0 && (
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Verifizierungstyp</InputLabel>
                      <Select
                        value={formData.verification_type}
                        onChange={(e) => handleVerificationTypeChange(e.target.value as 'shop' | 'service')}
                        label="Verifizierungstyp"
                      >
                        <MenuItem value="shop">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon />
                            Geschäft/Shop
                          </Box>
                        </MenuItem>
                        <MenuItem value="service">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon />
                            Dienstleister
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Step 1: Unternehmensdaten */}
                {index === 1 && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Unternehmensname"
                      value={formData.company_name}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Steuernummer / USt-ID"
                      value={formData.tax_id}
                      onChange={(e) => handleTaxIdChange(e.target.value)}
                      required
                    />
                  </Box>
                )}

                {/* Step 2: Dokumente */}
                {index === 2 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        Dokumente hochladen
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={(e) => handleDocumentUpload(e.target.files)}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </Button>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Unterstützte Formate: PDF, JPG, PNG, DOC, DOCX
                      </Typography>
                    </Box>

                    {formData.documents.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Hochgeladene Dokumente:
                        </Typography>
                        {formData.documents.map((doc, docIndex) => (
                          <Paper key={docIndex} sx={{ p: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <DocumentIcon color="primary" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Dokumenttyp</InputLabel>
                                <Select
                                  value={formData.document_types[docIndex]}
                                  onChange={(e) => handleDocumentTypeChange(docIndex, e.target.value)}
                                  label="Dokumenttyp"
                                >
                                  <MenuItem value="business_license">Gewerbeschein</MenuItem>
                                  <MenuItem value="tax_certificate">Steuerbescheinigung</MenuItem>
                                  <MenuItem value="id_document">Ausweisdokument</MenuItem>
                                  <MenuItem value="bank_statement">Bankauszug</MenuItem>
                                  <MenuItem value="other">Sonstiges</MenuItem>
                                </Select>
                              </FormControl>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => removeDocument(docIndex)}
                              >
                                Entfernen
                              </Button>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Step 3: Zusammenfassung */}
                {index === 3 && (
                  <Box sx={{ mb: 2 }}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Zusammenfassung Ihres Antrags:
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <strong>Typ:</strong> {formData.verification_type === 'shop' ? 'Geschäft' : 'Dienstleister'}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <strong>Unternehmen:</strong> {formData.company_name}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <strong>Steuernummer:</strong> {formData.tax_id}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <strong>Dokumente:</strong> {formData.documents.length} Dateien
                      </Box>
                    </Paper>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? submitVerification : handleNext}
                    disabled={!canProceedToNext() || loading}
                    sx={{ mr: 1 }}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : index === steps.length - 1 ? (
                      'Verifizierung einreichen'
                    ) : (
                      'Weiter'
                    )}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Zurück
                  </Button>
                  {onCancel && (
                    <Button onClick={onCancel}>
                      Abbrechen
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default SellerVerificationForm;
