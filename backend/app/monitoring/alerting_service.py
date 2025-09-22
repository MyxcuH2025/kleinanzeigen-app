"""
Alerting Service für proaktive Benachrichtigungen
"""
import logging
import smtplib
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass
import asyncio
from config import config

logger = logging.getLogger(__name__)

@dataclass
class AlertRule:
    """Alert-Regel Definition"""
    id: str
    name: str
    description: str
    metric: str
    operator: str  # "gt", "lt", "eq", "gte", "lte"
    threshold: float
    severity: str  # "low", "medium", "high", "critical"
    enabled: bool = True
    cooldown_minutes: int = 15  # Mindestabstand zwischen Alerts

@dataclass
class NotificationChannel:
    """Benachrichtigungs-Kanal"""
    id: str
    type: str  # "email", "webhook", "slack"
    name: str
    config: Dict[str, Any]
    enabled: bool = True

class AlertingService:
    """
    Service für proaktive Alerting und Benachrichtigungen
    """
    
    def __init__(self):
        self.alert_rules: List[AlertRule] = []
        self.notification_channels: List[NotificationChannel] = []
        self.alert_history: List[Dict[str, Any]] = []
        self.last_alert_times: Dict[str, datetime] = {}
        
        # Standard-Alert-Regeln definieren
        self._setup_default_rules()
        
        # Standard-Benachrichtigungskanäle definieren
        self._setup_default_channels()
        
        logger.info("AlertingService initialisiert")
    
    def _setup_default_rules(self):
        """Standard-Alert-Regeln einrichten"""
        default_rules = [
            AlertRule(
                id="cpu_high",
                name="Hohe CPU-Auslastung",
                description="CPU-Auslastung über 80%",
                metric="cpu_percent",
                operator="gt",
                threshold=80.0,
                severity="high",
                cooldown_minutes=15
            ),
            AlertRule(
                id="memory_high",
                name="Hohe Speicher-Auslastung",
                description="Speicher-Auslastung über 85%",
                metric="memory_percent",
                operator="gt",
                threshold=85.0,
                severity="high",
                cooldown_minutes=10
            ),
            AlertRule(
                id="disk_high",
                name="Hohe Festplatten-Auslastung",
                description="Festplatten-Speicher über 90%",
                metric="disk_usage_percent",
                operator="gt",
                threshold=90.0,
                severity="critical",
                cooldown_minutes=5
            ),
            AlertRule(
                id="error_rate_high",
                name="Hohe Fehlerrate",
                description="HTTP-Fehlerrate über 5%",
                metric="error_rate_percent",
                operator="gt",
                threshold=5.0,
                severity="high",
                cooldown_minutes=10
            ),
            AlertRule(
                id="response_time_high",
                name="Hohe Response-Zeit",
                description="Durchschnittliche Response-Zeit über 2000ms",
                metric="average_response_time_ms",
                operator="gt",
                threshold=2000.0,
                severity="medium",
                cooldown_minutes=15
            ),
            AlertRule(
                id="cache_hit_rate_low",
                name="Niedrige Cache-Hit-Rate",
                description="Cache-Hit-Rate unter 50%",
                metric="cache_hit_rate_percent",
                operator="lt",
                threshold=50.0,
                severity="medium",
                cooldown_minutes=30
            ),
            AlertRule(
                id="database_connections_high",
                name="Hohe Datenbank-Verbindungen",
                description="Anzahl DB-Verbindungen über 80% des Limits",
                metric="database_connections",
                operator="gt",
                threshold=16.0,  # 80% von 20
                severity="high",
                cooldown_minutes=10
            ),
            AlertRule(
                id="elasticsearch_down",
                name="Elasticsearch nicht verfügbar",
                description="Elasticsearch-Service ist nicht erreichbar",
                metric="elasticsearch_status",
                operator="eq",
                threshold=0.0,  # 0 = nicht verfügbar
                severity="critical",
                cooldown_minutes=5
            )
        ]
        
        self.alert_rules.extend(default_rules)
        logger.info(f"{len(default_rules)} Standard-Alert-Regeln geladen")
    
    def _setup_default_channels(self):
        """Standard-Benachrichtigungskanäle einrichten"""
        # E-Mail-Kanal (falls konfiguriert)
        if hasattr(config, 'MAIL_USERNAME') and config.MAIL_USERNAME:
            email_channel = NotificationChannel(
                id="email_admin",
                type="email",
                name="Admin E-Mail",
                config={
                    "smtp_server": config.MAIL_SERVER,
                    "smtp_port": config.MAIL_PORT,
                    "username": config.MAIL_USERNAME,
                    "password": config.MAIL_PASSWORD,
                    "from_email": config.MAIL_FROM,
                    "to_emails": ["admin@kleinanzeigen.de", "ops@kleinanzeigen.de"]
                }
            )
            self.notification_channels.append(email_channel)
        
        # Webhook-Kanal (für externe Systeme)
        webhook_channel = NotificationChannel(
            id="webhook_monitoring",
            type="webhook",
            name="Monitoring Webhook",
            config={
                "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
                "headers": {"Content-Type": "application/json"},
                "timeout": 10
            },
            enabled=False  # Standardmäßig deaktiviert
        )
        self.notification_channels.append(webhook_channel)
        
        logger.info(f"{len(self.notification_channels)} Benachrichtigungskanäle konfiguriert")
    
    def evaluate_metrics(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Bewerte Metriken gegen Alert-Regeln"""
        triggered_alerts = []
        current_time = datetime.utcnow()
        
        for rule in self.alert_rules:
            if not rule.enabled:
                continue
            
            # Cooldown prüfen
            last_alert_time = self.last_alert_times.get(rule.id)
            if last_alert_time:
                time_since_last = current_time - last_alert_time
                if time_since_last < timedelta(minutes=rule.cooldown_minutes):
                    continue
            
            # Metrik-Wert extrahieren
            metric_value = self._extract_metric_value(metrics, rule.metric)
            if metric_value is None:
                continue
            
            # Regel auswerten
            if self._evaluate_rule(metric_value, rule.operator, rule.threshold):
                alert = {
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "description": rule.description,
                    "severity": rule.severity,
                    "metric": rule.metric,
                    "value": metric_value,
                    "threshold": rule.threshold,
                    "operator": rule.operator,
                    "timestamp": current_time.isoformat(),
                    "status": "triggered"
                }
                
                triggered_alerts.append(alert)
                self.last_alert_times[rule.id] = current_time
                
                logger.warning(f"Alert ausgelöst: {rule.name} - {metric_value} {rule.operator} {rule.threshold}")
        
        return triggered_alerts
    
    def _extract_metric_value(self, metrics: Dict[str, Any], metric_path: str) -> Optional[float]:
        """Extrahiere Metrik-Wert aus verschachtelter Struktur"""
        try:
            # Unterstütze verschachtelte Pfade wie "system.cpu_percent"
            parts = metric_path.split('.')
            value = metrics
            
            for part in parts:
                if isinstance(value, dict) and part in value:
                    value = value[part]
                else:
                    return None
            
            # Konvertiere zu float falls möglich
            if isinstance(value, (int, float)):
                return float(value)
            elif isinstance(value, str):
                # Spezielle Behandlung für Status-Werte
                if value == "available":
                    return 1.0
                elif value in ["unavailable", "error"]:
                    return 0.0
                else:
                    return float(value)
            
            return None
            
        except (ValueError, TypeError):
            return None
    
    def _evaluate_rule(self, value: float, operator: str, threshold: float) -> bool:
        """Bewerte eine Alert-Regel"""
        try:
            if operator == "gt":
                return value > threshold
            elif operator == "gte":
                return value >= threshold
            elif operator == "lt":
                return value < threshold
            elif operator == "lte":
                return value <= threshold
            elif operator == "eq":
                return value == threshold
            else:
                logger.error(f"Unbekannter Operator: {operator}")
                return False
        except Exception as e:
            logger.error(f"Fehler bei Regel-Auswertung: {e}")
            return False
    
    async def send_notifications(self, alerts: List[Dict[str, Any]]):
        """Sende Benachrichtigungen für ausgelöste Alerts"""
        if not alerts:
            return
        
        for channel in self.notification_channels:
            if not channel.enabled:
                continue
            
            try:
                if channel.type == "email":
                    await self._send_email_notification(channel, alerts)
                elif channel.type == "webhook":
                    await self._send_webhook_notification(channel, alerts)
                elif channel.type == "slack":
                    await self._send_slack_notification(channel, alerts)
                
                logger.info(f"Benachrichtigungen über {channel.name} gesendet")
                
            except Exception as e:
                logger.error(f"Fehler beim Senden über {channel.name}: {e}")
    
    async def _send_email_notification(self, channel: NotificationChannel, alerts: List[Dict[str, Any]]):
        """Sende E-Mail-Benachrichtigung"""
        try:
            config_data = channel.config
            
            # E-Mail-Inhalt erstellen
            subject = f"🚨 Kleinanzeigen Alerts - {len(alerts)} Warnung(en)"
            
            html_body = self._create_email_html(alerts)
            text_body = self._create_email_text(alerts)
            
            # E-Mail-Nachricht erstellen
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = config_data['from_email']
            msg['To'] = ', '.join(config_data['to_emails'])
            
            # Text- und HTML-Teile hinzufügen
            text_part = MIMEText(text_body, 'plain', 'utf-8')
            html_part = MIMEText(html_body, 'html', 'utf-8')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # E-Mail senden
            with smtplib.SMTP(config_data['smtp_server'], config_data['smtp_port']) as server:
                server.starttls()
                server.login(config_data['username'], config_data['password'])
                
                for to_email in config_data['to_emails']:
                    server.send_message(msg, to_addrs=[to_email])
            
            logger.info(f"E-Mail-Benachrichtigung an {len(config_data['to_emails'])} Empfänger gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der E-Mail-Benachrichtigung: {e}")
            raise
    
    async def _send_webhook_notification(self, channel: NotificationChannel, alerts: List[Dict[str, Any]]):
        """Sende Webhook-Benachrichtigung"""
        try:
            import httpx
            
            config_data = channel.config
            
            # Webhook-Payload erstellen
            payload = {
                "text": f"🚨 Kleinanzeigen Alerts - {len(alerts)} Warnung(en)",
                "attachments": [
                    {
                        "color": self._get_severity_color(alert['severity']),
                        "title": alert['rule_name'],
                        "text": alert['description'],
                        "fields": [
                            {
                                "title": "Wert",
                                "value": f"{alert['value']:.2f}",
                                "short": True
                            },
                            {
                                "title": "Schwellenwert",
                                "value": f"{alert['threshold']:.2f}",
                                "short": True
                            },
                            {
                                "title": "Zeitstempel",
                                "value": alert['timestamp'],
                                "short": False
                            }
                        ]
                    }
                    for alert in alerts
                ]
            }
            
            # Webhook senden
            async with httpx.AsyncClient(timeout=config_data.get('timeout', 10)) as client:
                response = await client.post(
                    config_data['url'],
                    json=payload,
                    headers=config_data.get('headers', {})
                )
                response.raise_for_status()
            
            logger.info(f"Webhook-Benachrichtigung gesendet: {response.status_code}")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Webhook-Benachrichtigung: {e}")
            raise
    
    async def _send_slack_notification(self, channel: NotificationChannel, alerts: List[Dict[str, Any]]):
        """Sende Slack-Benachrichtigung (ähnlich wie Webhook)"""
        # Slack verwendet das gleiche Format wie Webhook
        await self._send_webhook_notification(channel, alerts)
    
    def _create_email_html(self, alerts: List[Dict[str, Any]]) -> str:
        """Erstelle HTML-E-Mail-Inhalt"""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
                .alert { margin: 15px 0; padding: 15px; border-left: 5px solid; border-radius: 5px; }
                .critical { border-color: #dc3545; background-color: #f8d7da; }
                .high { border-color: #fd7e14; background-color: #fff3cd; }
                .medium { border-color: #ffc107; background-color: #fff3cd; }
                .low { border-color: #28a745; background-color: #d4edda; }
                .metric { font-weight: bold; color: #007bff; }
                .timestamp { color: #6c757d; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚨 Kleinanzeigen System Alerts</h1>
                <p>Es wurden <strong>{count}</strong> Alert(s) ausgelöst.</p>
            </div>
        """.format(count=len(alerts))
        
        for alert in alerts:
            severity_class = alert['severity']
            html += f"""
            <div class="alert {severity_class}">
                <h3>{alert['rule_name']}</h3>
                <p>{alert['description']}</p>
                <p><span class="metric">Aktueller Wert:</span> {alert['value']:.2f}</p>
                <p><span class="metric">Schwellenwert:</span> {alert['threshold']:.2f}</p>
                <p class="timestamp">Zeitstempel: {alert['timestamp']}</p>
            </div>
            """
        
        html += """
            <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                <p><strong>Kleinanzeigen Monitoring System</strong></p>
                <p>Diese Benachrichtigung wurde automatisch generiert.</p>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _create_email_text(self, alerts: List[Dict[str, Any]]) -> str:
        """Erstelle Text-E-Mail-Inhalt"""
        text = f"KLEINANZEIGEN SYSTEM ALERTS\n"
        text += f"Es wurden {len(alerts)} Alert(s) ausgelöst.\n\n"
        
        for alert in alerts:
            text += f"🚨 {alert['rule_name']}\n"
            text += f"   Beschreibung: {alert['description']}\n"
            text += f"   Aktueller Wert: {alert['value']:.2f}\n"
            text += f"   Schwellenwert: {alert['threshold']:.2f}\n"
            text += f"   Schweregrad: {alert['severity'].upper()}\n"
            text += f"   Zeitstempel: {alert['timestamp']}\n\n"
        
        text += "Kleinanzeigen Monitoring System\n"
        text += "Diese Benachrichtigung wurde automatisch generiert."
        
        return text
    
    def _get_severity_color(self, severity: str) -> str:
        """Erhalte Farbe für Schweregrad"""
        colors = {
            "critical": "#dc3545",  # Rot
            "high": "#fd7e14",      # Orange
            "medium": "#ffc107",    # Gelb
            "low": "#28a745"        # Grün
        }
        return colors.get(severity, "#6c757d")  # Grau als Fallback
    
    def add_alert_rule(self, rule: AlertRule):
        """Füge neue Alert-Regel hinzu"""
        self.alert_rules.append(rule)
        logger.info(f"Neue Alert-Regel hinzugefügt: {rule.name}")
    
    def update_alert_rule(self, rule_id: str, updates: Dict[str, Any]):
        """Aktualisiere Alert-Regel"""
        for rule in self.alert_rules:
            if rule.id == rule_id:
                for key, value in updates.items():
                    if hasattr(rule, key):
                        setattr(rule, key, value)
                logger.info(f"Alert-Regel aktualisiert: {rule_id}")
                return True
        return False
    
    def delete_alert_rule(self, rule_id: str):
        """Lösche Alert-Regel"""
        self.alert_rules = [rule for rule in self.alert_rules if rule.id != rule_id]
        logger.info(f"Alert-Regel gelöscht: {rule_id}")
    
    def get_alert_rules(self) -> List[Dict[str, Any]]:
        """Erhalte alle Alert-Regeln"""
        return [
            {
                "id": rule.id,
                "name": rule.name,
                "description": rule.description,
                "metric": rule.metric,
                "operator": rule.operator,
                "threshold": rule.threshold,
                "severity": rule.severity,
                "enabled": rule.enabled,
                "cooldown_minutes": rule.cooldown_minutes
            }
            for rule in self.alert_rules
        ]
    
    def get_notification_channels(self) -> List[Dict[str, Any]]:
        """Erhalte alle Benachrichtigungskanäle"""
        return [
            {
                "id": channel.id,
                "type": channel.type,
                "name": channel.name,
                "enabled": channel.enabled,
                "config": {k: v for k, v in channel.config.items() if k != "password"}  # Passwort verstecken
            }
            for channel in self.notification_channels
        ]

# Globale AlertingService-Instanz
alerting_service = AlertingService()
