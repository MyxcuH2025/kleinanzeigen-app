#!/usr/bin/env python3
"""
Migration Runner für Kleinanzeigen API
- Führt alle ausstehenden Migrationen aus
- Deployment-ready Lösung für Datenbank-Updates
"""
import sys
import importlib
from pathlib import Path
import logging
import sqlite3
from datetime import datetime

logger = logging.getLogger(__name__)

class MigrationRunner:
    def __init__(self, db_path: str = "database.db"):
        self.db_path = db_path
        self.migrations_dir = Path(__file__).parent
        
    def create_migrations_table(self):
        """Erstelle migrations-Tabelle falls nicht vorhanden"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration_name TEXT UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'success'
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_executed_migrations(self):
        """Hole alle bereits ausgeführten Migrationen"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT migration_name FROM migrations WHERE status = 'success'")
        executed = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        return executed
    
    def mark_migration_executed(self, migration_name: str, status: str = "success"):
        """Markiere Migration als ausgeführt"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO migrations (migration_name, executed_at, status)
            VALUES (?, ?, ?)
        """, (migration_name, datetime.utcnow().isoformat(), status))
        
        conn.commit()
        conn.close()
    
    def get_available_migrations(self):
        """Hole alle verfügbaren Migrationen"""
        migrations = []
        for file in self.migrations_dir.glob("*.py"):
            if file.name.startswith("0") and file.name != "__init__.py":
                migration_name = file.stem
                migrations.append(migration_name)
        
        return sorted(migrations)
    
    def run_migration(self, migration_name: str):
        """Führe eine spezifische Migration aus"""
        try:
            # Importiere Migration-Modul
            module_name = f"migrations.{migration_name}"
            if module_name in sys.modules:
                del sys.modules[module_name]
            
            module = importlib.import_module(module_name)
            
            logger.info(f"🔄 Führe Migration {migration_name} aus...")
            
            # Führe upgrade() aus
            if hasattr(module, 'upgrade'):
                success = module.upgrade()
                if success:
                    self.mark_migration_executed(migration_name, "success")
                    logger.info(f"✅ Migration {migration_name} erfolgreich ausgeführt")
                    return True
                else:
                    self.mark_migration_executed(migration_name, "failed")
                    logger.error(f"❌ Migration {migration_name} fehlgeschlagen")
                    return False
            else:
                logger.error(f"❌ Migration {migration_name} hat keine upgrade() Funktion")
                return False
                
        except Exception as e:
            logger.error(f"❌ Fehler bei Migration {migration_name}: {e}")
            self.mark_migration_executed(migration_name, "failed")
            return False
    
    def run_all_migrations(self):
        """Führe alle ausstehenden Migrationen aus"""
        logger.info("🚀 Starte Migration Runner...")
        
        # Erstelle migrations-Tabelle
        self.create_migrations_table()
        
        # Hole verfügbare und ausgeführte Migrationen
        available = self.get_available_migrations()
        executed = self.get_executed_migrations()
        
        logger.info(f"📋 Verfügbare Migrationen: {available}")
        logger.info(f"✅ Bereits ausgeführt: {executed}")
        
        # Führe ausstehende Migrationen aus
        pending = [m for m in available if m not in executed]
        
        if not pending:
            logger.info("🎉 Alle Migrationen sind bereits ausgeführt!")
            return True
        
        logger.info(f"🔄 {len(pending)} ausstehende Migrationen: {pending}")
        
        success_count = 0
        for migration in pending:
            if self.run_migration(migration):
                success_count += 1
            else:
                logger.error(f"❌ Migration {migration} fehlgeschlagen - Stoppe")
                break
        
        if success_count == len(pending):
            logger.info(f"🎉 Alle {success_count} Migrationen erfolgreich ausgeführt!")
            return True
        else:
            logger.error(f"❌ Nur {success_count}/{len(pending)} Migrationen erfolgreich")
            return False

def main():
    """Hauptfunktion für Command-Line Ausführung"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    runner = MigrationRunner()
    success = runner.run_all_migrations()
    
    if success:
        print("✅ Alle Migrationen erfolgreich ausgeführt!")
        sys.exit(0)
    else:
        print("❌ Migrationen fehlgeschlagen!")
        sys.exit(1)

if __name__ == "__main__":
    main()
