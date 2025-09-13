"""
WebSocket Load Testing für Stories-Feature
Simuliert 40.000+ gleichzeitige WebSocket-Verbindungen
"""
import asyncio
import websockets
import json
import time
import random
import logging
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import statistics
import aiohttp

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LoadTestConfig:
    """Load-Test-Konfiguration"""
    base_url: str = "ws://localhost:8000"
    max_connections: int = 1000  # Schrittweise auf 40.000 steigern
    connection_interval: float = 0.1  # 100ms zwischen Verbindungen
    test_duration: int = 300  # 5 Minuten Test
    story_view_interval: float = 5.0  # Story-View alle 5 Sekunden
    ping_interval: float = 30.0  # Ping alle 30 Sekunden
    reaction_probability: float = 0.1  # 10% Chance auf Reaction

@dataclass
class ConnectionStats:
    """Verbindungsstatistiken"""
    connection_id: int
    connected_at: datetime
    messages_sent: int = 0
    messages_received: int = 0
    errors: int = 0
    last_ping: datetime = None
    last_story_view: datetime = None

class WebSocketLoadTester:
    """WebSocket Load Tester für Stories"""
    
    def __init__(self, config: LoadTestConfig):
        self.config = config
        self.connections: List[ConnectionStats] = []
        self.test_results = {
            'total_connections': 0,
            'successful_connections': 0,
            'failed_connections': 0,
            'total_messages_sent': 0,
            'total_messages_received': 0,
            'average_response_time': 0,
            'max_response_time': 0,
            'min_response_time': float('inf'),
            'error_rate': 0,
            'connections_per_second': 0
        }
        self.response_times = []
        self.start_time = None
        self.end_time = None
    
    async def run_load_test(self):
        """Hauptfunktion für Load-Test"""
        logger.info(f"🚀 Starte WebSocket Load-Test mit {self.config.max_connections} Verbindungen")
        self.start_time = time.time()
        
        # Verbindungen parallel erstellen
        tasks = []
        for i in range(self.config.max_connections):
            task = asyncio.create_task(self._create_connection(i))
            tasks.append(task)
            
            # Intervall zwischen Verbindungen
            if i < self.config.max_connections - 1:
                await asyncio.sleep(self.config.connection_interval)
        
        # Alle Verbindungen warten
        await asyncio.gather(*tasks, return_exceptions=True)
        
        # Test-Dauer abwarten
        logger.info(f"⏱️ Warte {self.config.test_duration} Sekunden für Test-Dauer")
        await asyncio.sleep(self.config.test_duration)
        
        self.end_time = time.time()
        await self._analyze_results()
    
    async def _create_connection(self, connection_id: int):
        """Einzelne WebSocket-Verbindung erstellen und testen"""
        try:
            # Mock-Token für Test (in Production würde man echte Tokens verwenden)
            test_token = f"test_token_{connection_id}"
            
            # WebSocket-Verbindung herstellen
            uri = f"{self.config.base_url}/ws/stories?token={test_token}"
            
            async with websockets.connect(uri) as websocket:
                stats = ConnectionStats(
                    connection_id=connection_id,
                    connected_at=datetime.now()
                )
                self.connections.append(stats)
                
                logger.info(f"✅ Verbindung {connection_id} erfolgreich")
                
                # WebSocket-Events simulieren
                await self._simulate_websocket_events(websocket, stats)
                
        except Exception as e:
            logger.error(f"❌ Verbindung {connection_id} fehlgeschlagen: {e}")
            self.test_results['failed_connections'] += 1
    
    async def _simulate_websocket_events(self, websocket, stats: ConnectionStats):
        """WebSocket-Events für eine Verbindung simulieren"""
        try:
            # Test-Dauer berechnen
            test_end_time = time.time() + self.config.test_duration
            
            while time.time() < test_end_time:
                # Story-View simulieren
                if (not stats.last_story_view or 
                    time.time() - stats.last_story_view.timestamp() > self.config.story_view_interval):
                    
                    await self._send_story_view(websocket, stats)
                    stats.last_story_view = datetime.now()
                
                # Ping simulieren
                if (not stats.last_ping or 
                    time.time() - stats.last_ping.timestamp() > self.config.ping_interval):
                    
                    await self._send_ping(websocket, stats)
                    stats.last_ping = datetime.now()
                
                # Reaction simulieren (niedrige Wahrscheinlichkeit)
                if random.random() < self.config.reaction_probability:
                    await self._send_story_reaction(websocket, stats)
                
                # Kurze Pause zwischen Events
                await asyncio.sleep(random.uniform(0.5, 2.0))
                
        except Exception as e:
            logger.error(f"❌ WebSocket-Events für Verbindung {stats.connection_id} fehlgeschlagen: {e}")
            stats.errors += 1
    
    async def _send_story_view(self, websocket, stats: ConnectionStats):
        """Story-View senden"""
        try:
            message = {
                "type": "story_view",
                "story_id": random.randint(1, 100),  # Mock Story-ID
                "timestamp": datetime.now().isoformat()
            }
            
            start_time = time.time()
            await websocket.send(json.dumps(message))
            stats.messages_sent += 1
            
            # Response warten
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            response_time = time.time() - start_time
            
            self.response_times.append(response_time)
            stats.messages_received += 1
            
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Timeout bei Story-View für Verbindung {stats.connection_id}")
            stats.errors += 1
        except Exception as e:
            logger.error(f"❌ Fehler bei Story-View für Verbindung {stats.connection_id}: {e}")
            stats.errors += 1
    
    async def _send_ping(self, websocket, stats: ConnectionStats):
        """Ping senden"""
        try:
            message = {
                "type": "ping",
                "timestamp": datetime.now().isoformat()
            }
            
            start_time = time.time()
            await websocket.send(json.dumps(message))
            stats.messages_sent += 1
            
            # Pong warten
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            response_time = time.time() - start_time
            
            self.response_times.append(response_time)
            stats.messages_received += 1
            
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Timeout bei Ping für Verbindung {stats.connection_id}")
            stats.errors += 1
        except Exception as e:
            logger.error(f"❌ Fehler bei Ping für Verbindung {stats.connection_id}: {e}")
            stats.errors += 1
    
    async def _send_story_reaction(self, websocket, stats: ConnectionStats):
        """Story-Reaction senden"""
        try:
            message = {
                "type": "story_reaction",
                "story_id": random.randint(1, 100),
                "reaction": random.choice(["❤️", "👍", "😮", "😢"]),
                "timestamp": datetime.now().isoformat()
            }
            
            start_time = time.time()
            await websocket.send(json.dumps(message))
            stats.messages_sent += 1
            
            # Response warten
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            response_time = time.time() - start_time
            
            self.response_times.append(response_time)
            stats.messages_received += 1
            
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Timeout bei Story-Reaction für Verbindung {stats.connection_id}")
            stats.errors += 1
        except Exception as e:
            logger.error(f"❌ Fehler bei Story-Reaction für Verbindung {stats.connection_id}: {e}")
            stats.errors += 1
    
    async def _analyze_results(self):
        """Test-Ergebnisse analysieren"""
        logger.info("📊 Analysiere Load-Test-Ergebnisse...")
        
        # Grundstatistiken
        self.test_results['total_connections'] = len(self.connections)
        self.test_results['successful_connections'] = len([c for c in self.connections if c.errors == 0])
        self.test_results['failed_connections'] = len([c for c in self.connections if c.errors > 0])
        
        # Nachrichtenstatistiken
        self.test_results['total_messages_sent'] = sum(c.messages_sent for c in self.connections)
        self.test_results['total_messages_received'] = sum(c.messages_received for c in self.connections)
        
        # Response-Zeit-Statistiken
        if self.response_times:
            self.test_results['average_response_time'] = statistics.mean(self.response_times)
            self.test_results['max_response_time'] = max(self.response_times)
            self.test_results['min_response_time'] = min(self.response_times)
        
        # Fehlerrate
        total_events = self.test_results['total_messages_sent']
        total_errors = sum(c.errors for c in self.connections)
        self.test_results['error_rate'] = (total_errors / total_events * 100) if total_events > 0 else 0
        
        # Verbindungen pro Sekunde
        test_duration = self.end_time - self.start_time
        self.test_results['connections_per_second'] = self.test_results['total_connections'] / test_duration
        
        # Ergebnisse ausgeben
        self._print_results()
        
        # Ergebnisse an Backend senden
        await self._send_results_to_backend()
    
    def _print_results(self):
        """Test-Ergebnisse ausgeben"""
        print("\n" + "="*60)
        print("🚀 WEBSOCKET LOAD-TEST ERGEBNISSE")
        print("="*60)
        print(f"📊 Gesamtverbindungen: {self.test_results['total_connections']}")
        print(f"✅ Erfolgreiche Verbindungen: {self.test_results['successful_connections']}")
        print(f"❌ Fehlgeschlagene Verbindungen: {self.test_results['failed_connections']}")
        print(f"📤 Nachrichten gesendet: {self.test_results['total_messages_sent']}")
        print(f"📥 Nachrichten empfangen: {self.test_results['total_messages_received']}")
        print(f"⚡ Durchschnittliche Response-Zeit: {self.test_results['average_response_time']:.3f}s")
        print(f"🚀 Maximale Response-Zeit: {self.test_results['max_response_time']:.3f}s")
        print(f"🏃 Minimale Response-Zeit: {self.test_results['min_response_time']:.3f}s")
        print(f"📈 Fehlerrate: {self.test_results['error_rate']:.2f}%")
        print(f"🔗 Verbindungen/Sekunde: {self.test_results['connections_per_second']:.2f}")
        print("="*60)
        
        # Performance-Bewertung
        self._evaluate_performance()
    
    def _evaluate_performance(self):
        """Performance bewerten"""
        print("\n🎯 PERFORMANCE-BEWERTUNG:")
        
        # Verbindungsrate
        if self.test_results['connections_per_second'] >= 100:
            print("✅ Verbindungsrate: EXCELLENT (≥100/s)")
        elif self.test_results['connections_per_second'] >= 50:
            print("🟡 Verbindungsrate: GOOD (≥50/s)")
        else:
            print("🔴 Verbindungsrate: NEEDS IMPROVEMENT (<50/s)")
        
        # Response-Zeit
        if self.test_results['average_response_time'] <= 0.1:
            print("✅ Response-Zeit: EXCELLENT (≤100ms)")
        elif self.test_results['average_response_time'] <= 0.5:
            print("🟡 Response-Zeit: GOOD (≤500ms)")
        else:
            print("🔴 Response-Zeit: NEEDS IMPROVEMENT (>500ms)")
        
        # Fehlerrate
        if self.test_results['error_rate'] <= 1:
            print("✅ Fehlerrate: EXCELLENT (≤1%)")
        elif self.test_results['error_rate'] <= 5:
            print("🟡 Fehlerrate: ACCEPTABLE (≤5%)")
        else:
            print("🔴 Fehlerrate: NEEDS IMPROVEMENT (>5%)")
        
        # Skalierbarkeit
        success_rate = (self.test_results['successful_connections'] / 
                       self.test_results['total_connections'] * 100) if self.test_results['total_connections'] > 0 else 0
        
        if success_rate >= 95:
            print("✅ Skalierbarkeit: EXCELLENT (≥95% Erfolg)")
        elif success_rate >= 90:
            print("🟡 Skalierbarkeit: GOOD (≥90% Erfolg)")
        else:
            print("🔴 Skalierbarkeit: NEEDS IMPROVEMENT (<90% Erfolg)")
    
    async def _send_results_to_backend(self):
        """Test-Ergebnisse an Backend senden"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "test_type": "websocket_load_test",
                    "results": self.test_results,
                    "timestamp": datetime.now().isoformat(),
                    "config": {
                        "max_connections": self.config.max_connections,
                        "test_duration": self.config.test_duration
                    }
                }
                
                async with session.post(
                    "http://localhost:8000/api/performance/load-test-results",
                    json=payload
                ) as response:
                    if response.status == 200:
                        logger.info("✅ Test-Ergebnisse erfolgreich an Backend gesendet")
                    else:
                        logger.warning(f"⚠️ Fehler beim Senden der Test-Ergebnisse: {response.status}")
                        
        except Exception as e:
            logger.error(f"❌ Fehler beim Senden der Test-Ergebnisse: {e}")

async def main():
    """Hauptfunktion"""
    # Konfiguration für verschiedene Test-Szenarien
    test_configs = [
        LoadTestConfig(max_connections=100, test_duration=60),    # Kleiner Test
        LoadTestConfig(max_connections=500, test_duration=120),   # Mittlerer Test
        LoadTestConfig(max_connections=1000, test_duration=180),  # Großer Test
        LoadTestConfig(max_connections=2000, test_duration=300),  # Sehr großer Test
    ]
    
    print("🚀 WebSocket Load-Testing für Stories-Feature")
    print("="*50)
    
    for i, config in enumerate(test_configs, 1):
        print(f"\n📊 Test {i}/{len(test_configs)}: {config.max_connections} Verbindungen")
        print("-" * 30)
        
        tester = WebSocketLoadTester(config)
        await tester.run_load_test()
        
        # Pause zwischen Tests
        if i < len(test_configs):
            print(f"\n⏸️ Pause vor nächstem Test...")
            await asyncio.sleep(30)

if __name__ == "__main__":
    asyncio.run(main())
