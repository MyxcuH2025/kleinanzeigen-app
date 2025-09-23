#!/usr/bin/env python3
"""
Test Runner für Kleinanzeigen Backend
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Führe Kommando aus und gib Ergebnis zurück"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} - ERFOLGREICH")
            if result.stdout:
                print("Output:")
                print(result.stdout)
        else:
            print(f"❌ {description} - FEHLGESCHLAGEN")
            if result.stderr:
                print("Errors:")
                print(result.stderr)
            if result.stdout:
                print("Output:")
                print(result.stdout)
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"❌ {description} - FEHLER: {e}")
        return False

def main():
    """Hauptfunktion für Test-Execution"""
    print("🚀 KLEINANZEIGEN BACKEND TEST SUITE")
    print("=" * 60)
    
    # Test-Verzeichnis setzen
    test_dir = Path(__file__).parent / "tests"
    os.chdir(Path(__file__).parent)
    
    # Pytest installieren falls nicht vorhanden
    try:
        import pytest
    except ImportError:
        print("📦 Installiere pytest...")
        run_command("pip install pytest pytest-asyncio pytest-cov", "Pytest Installation")
    
    # Test-Kategorien
    test_categories = [
        {
            "name": "Unit Tests",
            "pattern": "tests/unit/",
            "description": "Unit Tests für Services und Funktionen"
        },
        {
            "name": "Integration Tests", 
            "pattern": "tests/integration/",
            "description": "Integration Tests für API-Flows"
        },
        {
            "name": "E2E Tests",
            "pattern": "tests/e2e/",
            "description": "End-to-End Tests für User-Journeys"
        },
        {
            "name": "All Tests",
            "pattern": "tests/",
            "description": "Alle Tests"
        }
    ]
    
    # Test-Ergebnisse
    results = {}
    
    for category in test_categories:
        # Prüfe ob Test-Dateien existieren
        test_files = list(Path(category["pattern"]).glob("test_*.py"))
        
        if not test_files:
            print(f"⚠️ Keine Test-Dateien gefunden in {category['pattern']}")
            continue
        
        # Pytest-Kommando
        pytest_command = f"python -m pytest {category['pattern']} -v --tb=short"
        
        # Führe Tests aus
        success = run_command(pytest_command, category["name"])
        results[category["name"]] = success
    
    # Coverage-Report
    print(f"\n{'='*60}")
    print("📊 COVERAGE REPORT")
    print(f"{'='*60}")
    
    coverage_command = "python -m pytest tests/ --cov=app --cov-report=term-missing --cov-report=html"
    run_command(coverage_command, "Coverage Analysis")
    
    # Performance-Tests
    print(f"\n{'='*60}")
    print("⚡ PERFORMANCE TESTS")
    print(f"{'='*60}")
    
    performance_command = "python -m pytest tests/integration/test_api_flow.py::TestPerformanceFlow -v"
    run_command(performance_command, "Performance Tests")
    
    # Zusammenfassung
    print(f"\n{'='*60}")
    print("📋 TEST SUMMARY")
    print(f"{'='*60}")
    
    total_tests = len(results)
    passed_tests = sum(1 for success in results.values() if success)
    
    for category, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{category:<20} {status}")
    
    print(f"\nGesamt: {passed_tests}/{total_tests} Test-Kategorien erfolgreich")
    
    if passed_tests == total_tests:
        print("🎉 ALLE TESTS ERFOLGREICH!")
        return 0
    else:
        print("⚠️ EINIGE TESTS FEHLGESCHLAGEN")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
