#!/usr/bin/env python3
"""
Einfaches Load-Test-Skript für Stories WebSocket
Führt schrittweise Load-Tests durch
"""
import asyncio
import sys
import os

# Backend-Pfad hinzufügen
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from load_tests.websocket_load_test import WebSocketLoadTester, LoadTestConfig

async def run_quick_test():
    """Schneller Test für Entwicklung"""
    print("🚀 Starte Quick Load-Test (100 Verbindungen)")
    
    config = LoadTestConfig(
        max_connections=100,
        test_duration=30,  # 30 Sekunden
        connection_interval=0.05  # 50ms zwischen Verbindungen
    )
    
    tester = WebSocketLoadTester(config)
    await tester.run_load_test()

async def run_medium_test():
    """Mittlerer Test"""
    print("🚀 Starte Medium Load-Test (500 Verbindungen)")
    
    config = LoadTestConfig(
        max_connections=500,
        test_duration=60,  # 1 Minute
        connection_interval=0.1  # 100ms zwischen Verbindungen
    )
    
    tester = WebSocketLoadTester(config)
    await tester.run_load_test()

async def run_full_test():
    """Vollständiger Test"""
    print("🚀 Starte Full Load-Test (1000 Verbindungen)")
    
    config = LoadTestConfig(
        max_connections=1000,
        test_duration=120,  # 2 Minuten
        connection_interval=0.1  # 100ms zwischen Verbindungen
    )
    
    tester = WebSocketLoadTester(config)
    await tester.run_load_test()

async def main():
    """Hauptfunktion"""
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
        
        if test_type == "quick":
            await run_quick_test()
        elif test_type == "medium":
            await run_medium_test()
        elif test_type == "full":
            await run_full_test()
        else:
            print("❌ Unbekannter Test-Typ. Verwende: quick, medium, full")
    else:
        print("🚀 WebSocket Load-Test für Stories-Feature")
        print("=" * 50)
        print("Verfügbare Tests:")
        print("  quick  - 100 Verbindungen, 30s")
        print("  medium - 500 Verbindungen, 60s")
        print("  full   - 1000 Verbindungen, 120s")
        print("")
        print("Verwendung: python run_load_test.py [quick|medium|full]")
        
        # Standard: Quick Test
        print("\n🏃 Führe Quick Test aus...")
        await run_quick_test()

if __name__ == "__main__":
    asyncio.run(main())
