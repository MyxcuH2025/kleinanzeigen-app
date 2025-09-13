import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface SystemHealth {
  uptimePercentage: number;
  responseTime: number;
  apiCallsPerMin: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  activeConnections: number;
}

interface SystemLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  source: string;
}

interface ApiUsage {
  endpoint: string;
  callsPerMin: number;
  usage: number;
  avgResponseTime: number;
}

interface CacheStats {
  hitRate: number;
  sizeGB: number;
  keys: number;
  ttlAverageMinutes: number;
}

interface MaintenanceTask {
  id: string;
  name: string;
  schedule: string;
  status: 'automatic' | 'planned' | 'manual';
  lastRun: string;
  nextRun: string;
}

interface AdminSystemProps {
  systemHealth: SystemHealth | null;
  systemLogs: SystemLog[];
  apiUsage: ApiUsage[];
  cacheStats: CacheStats | null;
  maintenanceTasks: MaintenanceTask[];
  loading: boolean;
  onRefreshSystem: () => void;
  onExportSystemReport: (format: 'pdf' | 'csv' | 'json') => void;
  onClearCache: () => void;
  onOptimizeCache: () => void;
  onRunMaintenanceTask: (taskId: string) => void;
  onScheduleMaintenance: (task: Partial<MaintenanceTask>) => void;
  onUpdateSystemConfig: (config: any) => void;
  onBackupSystem: () => void;
  onUpdateSystem: () => void;
  onRunSecurityScan: () => void;
  onRunPerformanceTest: () => void;
  onHealthCheck: () => void;
}

export const AdminSystem: React.FC<AdminSystemProps> = ({
  systemHealth,
  systemLogs,
  apiUsage,
  cacheStats,
  maintenanceTasks,
  loading,
  onRefreshSystem,
  onExportSystemReport,
  onClearCache,
  onOptimizeCache,
  onRunMaintenanceTask,
  onScheduleMaintenance,
  onUpdateSystemConfig,
  onBackupSystem,
  onUpdateSystem,
  onRunSecurityScan,
  onRunPerformanceTest,
  onHealthCheck
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'INFO' | 'WARN' | 'ERROR'>('all');
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const filteredLogs = logFilter === 'all' 
    ? systemLogs 
    : systemLogs.filter(log => log.level === logFilter);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'INFO': return '#4caf50';
      case 'WARN': return '#ff9800';
      case 'ERROR': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'automatic': return 'success';
      case 'planned': return 'warning';
      case 'manual': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'automatic': return 'Automatisch';
      case 'planned': return 'Geplant';
      case 'manual': return 'Manuell';
      default: return status;
    }
  };

  const systemActions = [
    { id: 'backup', label: 'Backup erstellen', icon: <BackupIcon />, color: 'primary' },
    { id: 'update', label: 'System Update', icon: <UpdateIcon />, color: 'warning' },
    { id: 'security', label: 'Security Scan', icon: <SecurityIcon />, color: 'error' },
    { id: 'performance', label: 'Performance Test', icon: <AnalyticsIcon />, color: 'info' },
    { id: 'config', label: 'Config Backup', icon: <EditIcon />, color: 'default' },
    { id: 'health', label: 'Health Check', icon: <CheckIcon />, color: 'success' }
  ];

  return (
    <Box>
      {/* Header mit Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">System Administration</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportSystemReport('pdf')}
            startIcon={<DownloadIcon />}
          >
            System Report
          </Button>
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={onRefreshSystem}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            {loading ? 'Lädt...' : 'System aktualisieren'}
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Box>
          <Card sx={{ backgroundColor: '#e8f5e8' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.dark">
                    {systemHealth ? `${systemHealth.uptimePercentage}%` : '99.9%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                </Box>
                <CheckIcon color="success" />
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
                    {systemHealth ? `${systemHealth.responseTime}s` : '2.3s'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Response Time</Typography>
                </Box>
                <SpeedIcon color="warning" />
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
                    {systemHealth ? systemHealth.apiCallsPerMin.toLocaleString() : '1,247'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">API Calls/min</Typography>
                </Box>
                <AnalyticsIcon color="info" />
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
                    {systemHealth ? `${systemHealth.cpuUsage}%` : '45%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                </Box>
                <SettingsIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Server Monitoring & Logs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        {/* Server Performance */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Server Performance</Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {systemHealth ? `${systemHealth.cpuUsage}%` : '45%'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth ? systemHealth.cpuUsage : 45} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Memory Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {systemHealth ? `${systemHealth.memoryUsage}%` : '67%'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth ? systemHealth.memoryUsage : 67} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } 
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Disk Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {systemHealth ? `${systemHealth.diskUsage}%` : '23%'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth ? systemHealth.diskUsage : 23} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } 
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Network</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {systemHealth ? `${systemHealth.networkUsage} MB/s` : '12.5 MB/s'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth ? systemHealth.networkUsage : 35} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' } 
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Active Connections</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {systemHealth ? systemHealth.activeConnections.toLocaleString() : '1,247'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth ? Math.min((systemHealth.activeConnections / 2000) * 100, 100) : 78} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#9c27b0' } 
                    }} 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* System Logs */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">System Logs</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={logFilter}
                    label="Filter"
                    onChange={(e) => setLogFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">Alle</MenuItem>
                    <MenuItem value="INFO">INFO</MenuItem>
                    <MenuItem value="WARN">WARN</MenuItem>
                    <MenuItem value="ERROR">ERROR</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 300, overflow: 'auto', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          color: getLogColor(log.level), 
                          mb: 1 
                        }}
                      >
                        [{log.timestamp}] {log.level}: {log.message}
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                      Keine Logs verfügbar...
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip label="INFO" size="small" color="success" />
                <Chip label="WARN" size="small" color="warning" />
                <Chip label="ERROR" size="small" color="error" />
                <Button size="small" variant="outlined">Alle anzeigen</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* API Usage & Cache Management */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        {/* API Usage Tracking */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Usage Tracking</Typography>
              <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {apiUsage.length > 0 ? (
                  apiUsage.map((api, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{api.endpoint}</Typography>
                        <Typography variant="body2" fontWeight="bold">{api.callsPerMin}/min</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={api.usage} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Keine API-Usage-Daten verfügbar
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Cache Management */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cache Management</Typography>
              <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cache Hit Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cacheStats ? `${cacheStats.hitRate}%` : '87.3%'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={cacheStats ? cacheStats.hitRate : 87} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } 
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cache Size</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cacheStats ? `${cacheStats.sizeGB} GB` : '2.4 GB'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={cacheStats ? (cacheStats.sizeGB / 5) * 100 : 45} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cache Keys</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cacheStats ? cacheStats.keys.toLocaleString() : '12,847'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={cacheStats ? (cacheStats.keys / 20000) * 100 : 72} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' } 
                    }} 
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">TTL Average</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cacheStats ? `${cacheStats.ttlAverageMinutes}m` : '15m 32s'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={cacheStats ? (cacheStats.ttlAverageMinutes / 30) * 100 : 68} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } 
                    }} 
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button size="small" variant="outlined" onClick={onClearCache}>
                  Cache leeren
                </Button>
                <Button size="small" variant="outlined" onClick={onOptimizeCache}>
                  Cache optimieren
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* System Actions & Maintenance */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        {/* System Actions */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>System Aktionen</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {systemActions.map((action) => (
                  <Box key={action.id}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={action.icon}
                      onClick={() => {
                        switch (action.id) {
                          case 'backup': onBackupSystem(); break;
                          case 'update': onUpdateSystem(); break;
                          case 'security': onRunSecurityScan(); break;
                          case 'performance': onRunPerformanceTest(); break;
                          case 'health': onHealthCheck(); break;
                          default: break;
                        }
                      }}
                      fullWidth
                    >
                      {action.label}
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Maintenance Schedule */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Wartungsplan</Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => setMaintenanceDialog(true)}
                  startIcon={<ScheduleIcon />}
                >
                  Planen
                </Button>
              </Box>
              <Box sx={{ height: 200, overflow: 'auto' }}>
                {maintenanceTasks.map((task) => (
                  <Box key={task.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{task.name}</Typography>
                      <Chip 
                        label={getStatusLabel(task.status)} 
                        size="small" 
                        color={getStatusColor(task.status) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {task.schedule}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="text"
                        onClick={() => onRunMaintenanceTask(task.id)}
                        startIcon={<PlayIcon />}
                      >
                        Ausführen
                      </Button>
                      <Button 
                        size="small" 
                        variant="text"
                        onClick={() => {
                          setSelectedTask(task);
                          setMaintenanceDialog(true);
                        }}
                        startIcon={<EditIcon />}
                      >
                        Bearbeiten
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* System Status Footer */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>System Status</Typography>
              <Typography variant="body2" color="text.secondary">
                Alle Systeme funktionieren normal • Letzte Überprüfung: vor 2 Minuten
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Online" color="success" size="small" />
              <Chip label="Stabil" color="success" size="small" />
              <Chip label="Optimiert" color="success" size="small" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Wartungsaufgabe bearbeiten' : 'Neue Wartungsaufgabe planen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Aufgabenname"
              defaultValue={selectedTask?.name || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Zeitplan (Cron Expression)"
              defaultValue={selectedTask?.schedule || ''}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                defaultValue={selectedTask?.status || 'manual'}
                label="Status"
              >
                <MenuItem value="automatic">Automatisch</MenuItem>
                <MenuItem value="planned">Geplant</MenuItem>
                <MenuItem value="manual">Manuell</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              defaultValue={selectedTask?.name || ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Abbrechen</Button>
          <Button onClick={() => {
            onScheduleMaintenance({});
            setMaintenanceDialog(false);
            setSelectedTask(null);
          }} variant="contained">
            {selectedTask ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
