import * as React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  ModeEdit as ModeEditIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Message as MessageIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string | string[];
  user_id: number;
  created_at: string;
  status: 'active' | 'paused' | 'draft' | 'expired';
  views: number;
  messages: number;
  favorites: number;
  highlighted?: boolean;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: any;
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    farbe: string;
    unfallfrei: boolean;
  };
}

interface ListingsGridProps {
  listings: Listing[];
  onEdit: (listing: Listing) => void;
  onView: (listing: Listing) => void;
  onShare: (listing: Listing) => void;
  onToggleStatus: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onToggleFavorite: (listing: Listing) => void;
  getImageUrl: (images: string | string[], category?: string, title?: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const ListingsGrid: React.FC<ListingsGridProps> = ({
  listings,
  onEdit,
  onView,
  onShare,
  onToggleStatus,
  onDelete,
  onToggleFavorite,
  getImageUrl,
  getStatusColor,
  getStatusIcon,
  onImageError
}) => {


  
  // Test: Einfache Komponente zuerst
  if (listings.length === 0) {
    return <div>No listings to display</div>;
  }
  
  return (
    <Box sx={{ 
      display: 'block', 
      mt: 0 
    }}>
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginLeft: 0,
        paddingLeft: 0
      }}>
        <TableContainer sx={{ 
          height: 'calc(100vh - 200px)',
          minHeight: '400px'
        }}>
          <Table sx={{ 
            minWidth: 800,
            width: '100%'
          }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '50px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  ONLINE
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  BILD
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '180px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.8rem'
                }}>
                  TITEL
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  ERSTELLT
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  PREIS
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  PREISTYP
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  ANFRAGEN
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  BESUCHER
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  MERKLISTE
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '70px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  VORLAGE
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  width: '100px',
                  py: 1.5, 
                  px: 1.5,
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  Aktionen
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <TableRow 
                    key={listing.id} 
                    sx={{ 
                      '&:hover': { bgcolor: '#f9fafb' },
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    {/* ONLINE - Status Indikator */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        {listing.status === 'active' ? (
                          <PlayIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        ) : (
                          <PauseIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* BILD - Thumbnail */}
                    <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: 'none', textAlign: 'center' }}>
                      {(() => {

                        const imageUrl = getImageUrl(listing.images, listing.category, listing.title);

                        return (
                          <img
                            src={imageUrl}
                            alt={listing.title}
                            onError={(e) => {

                              onImageError(e);
                            }}
                            onLoad={() => {

                            }}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 4,
                              border: '1px solid #e5e7eb'
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    
                    {/* TITEL - Titel + Kategorie Badge */}
                    <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: 'none', width: '180px' }}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: '#374151',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px'
                          }}
                        >
                          {listing.title}
                        </Typography>
                        <Box sx={{ 
                          display: 'inline-block',
                          bgcolor: '#f3f4f6',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {listing.category}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* ERSTELLT - Erstellungsdatum */}
                    <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: 'none', width: '70px' }}>
                      <Typography variant="body2" sx={{ 
                        color: '#1976d2',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        {new Date(listing.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </TableCell>
                    
                    {/* PREIS - Preis */}
                    <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: 'none', width: '70px' }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#374151',
                        fontSize: '0.875rem'
                      }}>
                        {listing.price.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    
                    {/* PREISTYP - Preisart */}
                    <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: 'none', width: '70px' }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        VB
                      </Typography>
                    </TableCell>
                    
                    {/* ANFRAGEN - Nachrichten */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {listing.messages}
                      </Typography>
                    </TableCell>
                    
                    {/* BESUCHER - Views */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {listing.views}
                      </Typography>
                    </TableCell>
                    
                    {/* MERKLISTE - Favorites */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {listing.favorites}
                      </Typography>
                    </TableCell>
                    
                    {/* VORLAGE - Template */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        —
                      </Typography>
                    </TableCell>
                    
                    {/* Aktionen - Action Buttons */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: 1.5, 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit(listing)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { color: '#1976d2', bgcolor: '#f3f4f6' }
                            }}
                          >
                            <ModeEditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Anzeigen">
                          <IconButton 
                            size="small" 
                            onClick={() => onView(listing)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { color: '#10b981', bgcolor: '#f0fdf4' }
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Teilen">
                          <IconButton 
                            size="small" 
                            onClick={() => onShare(listing)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' }
                            }}
                          >
                            <ShareIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={listing.status === 'active' ? 'Pausieren' : 'Aktivieren'}>
                          <IconButton 
                            size="small" 
                            onClick={() => onToggleStatus(listing)}
                            sx={{ 
                              color: listing.status === 'active' ? '#fbbf24' : '#10b981',
                              '&:hover': { 
                                bgcolor: listing.status === 'active' ? '#fef3c7' : '#f0fdf4' 
                              }
                            }}
                          >
                            {listing.status === 'active' ? (
                              <PauseIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <PlayIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Löschen">
                          <IconButton 
                            size="small" 
                            onClick={() => onDelete(listing)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine Anzeigen gefunden
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
