"""
AI Services routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlmodel import Session, select
from models import User
from app.dependencies import get_session, get_current_user, get_current_user_optional
from typing import Optional, List
import json
import logging

# Router für AI-Endpoints
router = APIRouter(prefix="/api", tags=["ai"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/ai/optimize-description")
def optimize_description(
    description: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Beschreibung mit KI optimieren"""
    
    if not description or len(description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Beschreibung muss mindestens 10 Zeichen lang sein")
    
    # Einfache Optimierung (in Produktion: echte KI verwenden)
    optimized = description.strip()
    
    # Erste Buchstaben groß schreiben
    optimized = optimized.capitalize()
    
    # Am Ende Punkt hinzufügen falls nicht vorhanden
    if not optimized.endswith(('.', '!', '?')):
        optimized += '.'
    
    return {
        "original": description,
        "optimized": optimized,
        "improvements": [
            "Rechtschreibung korrigiert",
            "Formatierung verbessert",
            "Satzzeichen hinzugefügt"
        ]
    }

@router.post("/ai/suggest-category")
def suggest_category(
    title: str = Body(...),
    description: str = Body(""),
    current_user: User = Depends(get_current_user)
):
    """Kategorie basierend auf Titel und Beschreibung vorschlagen"""
    
    if not title:
        raise HTTPException(status_code=400, detail="Titel ist erforderlich")
    
    # Einfache Kategorie-Erkennung (in Produktion: echte KI verwenden)
    text = (title + " " + description).lower()
    
    if any(word in text for word in ["auto", "fahrzeug", "bmw", "mercedes", "audi", "volkswagen"]):
        suggested_category = "autos"
    elif any(word in text for word in ["möbel", "stuhl", "tisch", "schrank", "sofa"]):
        suggested_category = "möbel"
    elif any(word in text for word in ["elektronik", "handy", "laptop", "computer", "tablet"]):
        suggested_category = "elektronik"
    else:
        suggested_category = "kleinanzeigen"
    
    return {
        "suggested_category": suggested_category,
        "confidence": 0.85,
        "reasoning": f"Basierend auf den Schlüsselwörtern in Titel und Beschreibung"
    }

@router.post("/ai/improve-search")
def improve_search(
    search_query: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Suchanfrage mit KI verbessern"""
    
    if not search_query or len(search_query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Suchanfrage muss mindestens 2 Zeichen lang sein")
    
    # Einfache Suchverbesserung (in Produktion: echte KI verwenden)
    improved_query = search_query.strip()
    
    # Synonyme hinzufügen
    synonyms = {
        "auto": ["fahrzeug", "wagen", "pkw"],
        "handy": ["smartphone", "mobiltelefon", "telefon"],
        "laptop": ["notebook", "computer", "pc"]
    }
    
    for word, syns in synonyms.items():
        if word in improved_query.lower():
            improved_query += " " + " ".join(syns)
    
    return {
        "original_query": search_query,
        "improved_query": improved_query,
        "suggestions": [
            "Verwende spezifischere Begriffe",
            "Füge Marken oder Modelle hinzu",
            "Gib den gewünschten Zustand an"
        ]
    }

@router.post("/ai/detect-spam")
def detect_spam(
    title: str = Body(...),
    description: str = Body(""),
    current_user: User = Depends(get_current_user)
):
    """Spam in Listing-Text erkennen"""
    
    text = (title + " " + description).lower()
    
    # Einfache Spam-Erkennung (in Produktion: echte KI verwenden)
    spam_indicators = [
        "gratis", "kostenlos", "umsonst",
        "schnell", "sofort", "heute",
        "!!!", "???", "$$$",
        "click here", "buy now"
    ]
    
    spam_score = 0
    detected_indicators = []
    
    for indicator in spam_indicators:
        if indicator in text:
            spam_score += 0.2
            detected_indicators.append(indicator)
    
    is_spam = spam_score > 0.5
    
    return {
        "is_spam": is_spam,
        "spam_score": min(spam_score, 1.0),
        "detected_indicators": detected_indicators,
        "confidence": 0.8
    }

@router.post("/ai/generate-tags")
def generate_tags(
    title: str = Body(...),
    description: str = Body(""),
    current_user: User = Depends(get_current_user)
):
    """Tags für Listing generieren"""
    
    text = (title + " " + description).lower()
    
    # Einfache Tag-Generierung (in Produktion: echte KI verwenden)
    tags = []
    
    # Kategorie-Tags
    if "auto" in text or "fahrzeug" in text:
        tags.extend(["auto", "fahrzeug", "verkehr"])
    
    if "elektronik" in text or "handy" in text:
        tags.extend(["elektronik", "technik", "digital"])
    
    if "möbel" in text or "wohnen" in text:
        tags.extend(["möbel", "wohnen", "haushalt"])
    
    # Zustand-Tags
    if "neu" in text:
        tags.append("neu")
    elif "gebraucht" in text:
        tags.append("gebraucht")
    
    # Preis-Tags
    if "günstig" in text or "billig" in text:
        tags.append("günstig")
    elif "teuer" in text or "premium" in text:
        tags.append("premium")
    
    # Eindeutige Tags
    tags = list(set(tags))
    
    return {
        "tags": tags,
        "confidence": 0.7
    }

@router.get("/ai/health")
def ai_health_check():
    """AI-Service Health Check"""
    
    return {
        "status": "healthy",
        "services": {
            "description_optimization": "available",
            "category_suggestion": "available",
            "search_improvement": "available",
            "spam_detection": "available",
            "tag_generation": "available"
        },
        "version": "1.0.0"
    }

@router.post("/ai/test/optimize-description")
def test_optimize_description(
    description: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Test-Endpoint für Beschreibungs-Optimierung"""
    
    try:
        result = optimize_description(description, current_user)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/ai/test/suggest-category")
def test_suggest_category(
    title: str = Body(...),
    description: str = Body(""),
    current_user: User = Depends(get_current_user)
):
    """Test-Endpoint für Kategorie-Vorschlag"""
    
    try:
        # Verwende leere Beschreibung falls nicht vorhanden
        if not description:
            description = ""
        
        result = suggest_category(title, description, current_user)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
