"""
Migration 005: Add Stories Tables
Erstellt Stories-Tabellen für Instagram-Style Stories Feature
"""

from sqlmodel import SQLModel, create_engine
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def upgrade():
    """Stories-Tabellen erstellen"""
    
    # Stories-Haupttabelle
    stories_table = """
    CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
        thumbnail_url TEXT,
        caption TEXT,
        duration INTEGER DEFAULT 15,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
        views_count INTEGER DEFAULT 0,
        reactions_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        
        -- Performance-Indizes
        CONSTRAINT fk_stories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
    CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
    CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
    CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active);
    """
    
    # Story-Views-Tabelle
    story_views_table = """
    CREATE TABLE IF NOT EXISTS story_views (
        id SERIAL PRIMARY KEY,
        story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Eindeutige Kombination verhindern
        UNIQUE(story_id, viewer_id),
        CONSTRAINT fk_story_views_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        CONSTRAINT fk_story_views_viewer FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);
    CREATE INDEX IF NOT EXISTS idx_story_views_viewed_at ON story_views(viewed_at);
    """
    
    # Story-Reactions-Tabelle
    story_reactions_table = """
    CREATE TABLE IF NOT EXISTS story_reactions (
        id SERIAL PRIMARY KEY,
        story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Eindeutige Kombination verhindern
        UNIQUE(story_id, user_id),
        CONSTRAINT fk_story_reactions_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        CONSTRAINT fk_story_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON story_reactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_story_reactions_type ON story_reactions(reaction_type);
    """
    
    # Story-Comments-Tabelle (optional für erweiterte Features)
    story_comments_table = """
    CREATE TABLE IF NOT EXISTS story_comments (
        id SERIAL PRIMARY KEY,
        story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT false,
        
        CONSTRAINT fk_story_comments_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        CONSTRAINT fk_story_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_comments_user_id ON story_comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_story_comments_created_at ON story_comments(created_at);
    """
    
    # Trigger für automatische Story-Löschung nach Ablauf
    story_cleanup_trigger = """
    CREATE OR REPLACE FUNCTION cleanup_expired_stories()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Lösche abgelaufene Stories
        DELETE FROM stories 
        WHERE expires_at < NOW() AND is_active = true;
        
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Trigger alle 5 Minuten ausführen (wird von Backend-Cron übernommen)
    -- CREATE EVENT TRIGGER IF NOT EXISTS cleanup_stories_trigger
    -- ON SCHEDULE EVERY 5 MINUTE
    -- DO CALL cleanup_expired_stories();
    """
    
    # Views für Performance-Optimierung
    stories_with_stats_view = """
    CREATE OR REPLACE VIEW stories_with_stats AS
    SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.avatar as user_avatar,
        COUNT(DISTINCT sv.viewer_id) as unique_views,
        COUNT(DISTINCT sr.user_id) as unique_reactions,
        COUNT(DISTINCT sc.user_id) as unique_comments
    FROM stories s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN story_views sv ON s.id = sv.story_id
    LEFT JOIN story_reactions sr ON s.id = sr.story_id
    LEFT JOIN story_comments sc ON s.id = sc.story_id
    WHERE s.is_active = true
    GROUP BY s.id, u.id;
    """
    
    return [
        stories_table,
        story_views_table, 
        story_reactions_table,
        story_comments_table,
        story_cleanup_trigger,
        stories_with_stats_view
    ]

def downgrade():
    """Stories-Tabellen entfernen"""
    return [
        "DROP VIEW IF EXISTS stories_with_stats;",
        "DROP FUNCTION IF EXISTS cleanup_expired_stories();",
        "DROP TABLE IF EXISTS story_comments;",
        "DROP TABLE IF EXISTS story_reactions;",
        "DROP TABLE IF EXISTS story_views;",
        "DROP TABLE IF EXISTS stories;"
    ]

if __name__ == "__main__":
    from config import config
    
    # Engine für Migration
    engine = create_engine(config.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Upgrade ausführen
            for sql in upgrade():
                conn.execute(text(sql))
                conn.commit()
            
            logger.info("✅ Stories-Tabellen erfolgreich erstellt")
            
    except Exception as e:
        logger.error(f"❌ Fehler bei Stories-Migration: {e}")
        raise
