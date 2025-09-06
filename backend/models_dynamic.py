from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS FÜR DYNAMISCHE FORMULARE
# ============================================================================

class AttributeType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    BOOLEAN = "boolean"
    SELECT = "select"
    MULTISELECT = "multiselect"
    DATE = "date"
    TEXTAREA = "textarea"
    URL = "url"
    EMAIL = "email"
    PHONE = "phone"

class AttributeSection(str, Enum):
    ABOUT_ITEM = "about_item"      # "О квартире" / "Über den Artikel"
    SPECIFICATIONS = "specs"        # "Характеристики" / "Spezifikationen"
    ABOUT_HOUSE = "about_house"    # "О доме" / "Über das Haus"
    ADDITIONAL = "additional"       # Zusätzliche Informationen
    SHIPPING = "shipping"          # Versand & Abholung
    WARRANTY = "warranty"          # Garantie & Service

# ============================================================================
# KATEGORIEN-SYSTEM
# ============================================================================

class Category(SQLModel, table=True):
    """Hauptkategorien (Autos, Kleinanzeigen, Immobilien)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, description="Anzeigename der Kategorie")
    slug: str = Field(max_length=50, unique=True, description="URL-Slug")
    description: Optional[str] = Field(default=None, max_length=500)
    icon: Optional[str] = Field(default=None, max_length=200)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color
    bg_color: Optional[str] = Field(default=None, max_length=7)  # Hex background color
    parent_id: Optional[int] = Field(default=None, foreign_key="category.id", description="Für Unterkategorien")
    sort_order: int = Field(default=0, description="Sortierreihenfolge")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SubCategory(SQLModel, table=True):
    """Unterkategorien (Elektronik, Haus & Garten, etc.)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    slug: str = Field(max_length=50, unique=True)
    description: Optional[str] = Field(default=None, max_length=500)
    parent_id: int = Field(foreign_key="category.id")
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# ATTRIBUT-SYSTEM
# ============================================================================

class Attribute(SQLModel, table=True):
    """Definition von Attributen (z.B. Marke, Modell, Zustand)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(max_length=100, unique=True, description="Technischer Schlüssel (z.B. 'marke')")
    label: str = Field(max_length=200, description="Anzeigename (z.B. 'Marke')")
    type: AttributeType = Field(description="Datentyp des Attributs")
    section: AttributeSection = Field(description="Abschnitt im Formular")
    
    # Validierung
    required: bool = Field(default=False, description="Pflichtfeld")
    min_length: Optional[int] = Field(default=None, description="Minimale Länge für Text")
    max_length: Optional[int] = Field(default=None, description="Maximale Länge für Text")
    min_value: Optional[float] = Field(default=None, description="Minimaler Wert für Zahlen")
    max_value: Optional[float] = Field(default=None, description="Maximaler Wert für Zahlen")
    
    # UI-Konfiguration
    placeholder: Optional[str] = Field(default=None, max_length=200)
    help_text: Optional[str] = Field(default=None, max_length=500)
    unit: Optional[str] = Field(default=None, max_length=20, description="Einheit (z.B. 'km', '€')")
    
    # Erweiterte Features
    is_filterable: bool = Field(default=False, description="Kann als Filter verwendet werden")
    is_searchable: bool = Field(default=False, description="Wird in der Suche berücksichtigt")
    is_sortable: bool = Field(default=False, description="Kann sortiert werden")
    
    # Conditional Logic
    visible_if: Optional[str] = Field(default=None, max_length=500, description="JSON-Bedingung für Sichtbarkeit")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AttributeOption(SQLModel, table=True):
    """Auswahloptionen für Select/Multiselect-Attribute"""
    id: Optional[int] = Field(default=None, primary_key=True)
    attribute_id: int = Field(foreign_key="attribute.id")
    value: str = Field(max_length=100, description="Wert (z.B. 'BMW')")
    label: str = Field(max_length=200, description="Anzeigename (z.B. 'BMW')")
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryAttribute(SQLModel, table=True):
    """Zuordnung von Attributen zu Kategorien"""
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id")
    attribute_id: int = Field(foreign_key="attribute.id")
    
    # Kategorie-spezifische Konfiguration
    is_required: bool = Field(default=False, description="Pflichtfeld für diese Kategorie")
    is_filterable: bool = Field(default=False, description="Filterbar für diese Kategorie")
    order_index: int = Field(default=0, description="Reihenfolge im Formular")
    
    # Überschreibungen der Standard-Attribut-Einstellungen
    custom_label: Optional[str] = Field(default=None, max_length=200)
    custom_placeholder: Optional[str] = Field(default=None, max_length=200)
    custom_help_text: Optional[str] = Field(default=None, max_length=500)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# PYDANTIC MODELS FÜR API
# ============================================================================

class CategoryCreate(SQLModel):
    """Model für das Erstellen von Kategorien"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, max_length=500)
    icon: Optional[str] = Field(default=None, max_length=200)
    color: Optional[str] = Field(default=None, max_length=7)
    bg_color: Optional[str] = Field(default=None, max_length=7)
    parent_id: Optional[int] = Field(default=None)
    sort_order: int = Field(default=0)

class CategoryUpdate(SQLModel):
    """Model für das Aktualisieren von Kategorien"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, max_length=7)
    bg_color: Optional[str] = Field(None, max_length=7)
    parent_id: Optional[int] = Field(None)
    sort_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class AttributeCreate(SQLModel):
    """Model für das Erstellen von Attributen"""
    key: str = Field(..., min_length=1, max_length=100)
    label: str = Field(..., min_length=1, max_length=200)
    type: AttributeType
    section: AttributeSection
    required: bool = Field(default=False)
    min_length: Optional[int] = Field(None, ge=0)
    max_length: Optional[int] = Field(None, ge=1)
    min_value: Optional[float] = Field(None)
    max_value: Optional[float] = Field(None)
    placeholder: Optional[str] = Field(None, max_length=200)
    help_text: Optional[str] = Field(None, max_length=500)
    unit: Optional[str] = Field(None, max_length=20)
    is_filterable: bool = Field(default=False)
    is_searchable: bool = Field(default=False)
    is_sortable: bool = Field(default=False)
    visible_if: Optional[str] = Field(None, max_length=500)

class AttributeUpdate(SQLModel):
    """Model für das Aktualisieren von Attributen"""
    label: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[AttributeType] = Field(None)
    section: Optional[AttributeSection] = Field(None)
    required: Optional[bool] = Field(None)
    min_length: Optional[int] = Field(None, ge=0)
    max_length: Optional[int] = Field(None, ge=1)
    min_value: Optional[float] = Field(None)
    max_value: Optional[float] = Field(None)
    placeholder: Optional[str] = Field(None, max_length=200)
    help_text: Optional[str] = Field(None, max_length=500)
    unit: Optional[str] = Field(None, max_length=20)
    is_filterable: Optional[bool] = Field(None)
    is_searchable: Optional[bool] = Field(None)
    is_sortable: Optional[bool] = Field(None)
    visible_if: Optional[str] = Field(None, max_length=500)

class AttributeOptionCreate(SQLModel):
    """Model für das Erstellen von Attribut-Optionen"""
    value: str = Field(..., min_length=1, max_length=100)
    label: str = Field(..., min_length=1, max_length=200)
    sort_order: int = Field(default=0)

class CategoryAttributeCreate(SQLModel):
    """Model für das Zuordnen von Attributen zu Kategorien"""
    category_id: int
    attribute_id: int
    is_required: bool = Field(default=False)
    is_filterable: bool = Field(default=False)
    order_index: int = Field(default=0)
    custom_label: Optional[str] = Field(None, max_length=200)
    custom_placeholder: Optional[str] = Field(None, max_length=200)
    custom_help_text: Optional[str] = Field(None, max_length=500)

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class CategoryResponse(SQLModel):
    """Response-Model für Kategorien"""
    id: int
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    bg_color: Optional[str]
    parent_id: Optional[int]
    sort_order: int
    is_active: bool
    subcategories: List['CategoryResponse'] = []
    created_at: datetime
    updated_at: datetime

class AttributeResponse(SQLModel):
    """Response-Model für Attribute"""
    id: int
    key: str
    label: str
    type: AttributeType
    section: AttributeSection
    required: bool
    min_length: Optional[int]
    max_length: Optional[int]
    min_value: Optional[float]
    max_value: Optional[float]
    placeholder: Optional[str]
    help_text: Optional[str]
    unit: Optional[str]
    is_filterable: bool
    is_searchable: bool
    is_sortable: bool
    visible_if: Optional[str]
    options: List['AttributeOptionResponse'] = []
    created_at: datetime
    updated_at: datetime

class AttributeOptionResponse(SQLModel):
    """Response-Model für Attribut-Optionen"""
    id: int
    value: str
    label: str
    sort_order: int
    is_active: bool

class CategoryAttributeResponse(SQLModel):
    """Response-Model für Kategorie-Attribut-Zuordnungen"""
    id: int
    category_id: int
    attribute_id: int
    is_required: bool
    is_filterable: bool
    order_index: int
    custom_label: Optional[str]
    custom_placeholder: Optional[str]
    custom_help_text: Optional[str]
    attribute: AttributeResponse

# ============================================================================
# SCHEMA-MODELS FÜR FRONTEND
# ============================================================================

class FormFieldSchema(SQLModel):
    """Schema für ein einzelnes Formularfeld"""
    id: int
    key: str
    label: str
    type: AttributeType
    section: AttributeSection
    required: bool
    placeholder: Optional[str]
    help_text: Optional[str]
    unit: Optional[str]
    min_length: Optional[int]
    max_length: Optional[int]
    min_value: Optional[float]
    max_value: Optional[float]
    options: List[AttributeOptionResponse] = []
    visible_if: Optional[str]
    order_index: int

class CategoryFormSchema(SQLModel):
    """Vollständiges Formular-Schema für eine Kategorie"""
    category: CategoryResponse
    sections: List[AttributeSection]
    fields: List[FormFieldSchema]
    filters: List[FormFieldSchema]  # Nur filterbare Felder

# ============================================================================
# VALIDATION MODELS
# ============================================================================

class AttributeValue(SQLModel):
    """Validierung für Attribut-Werte"""
    key: str
    value: str | int | float | bool | List[str]
    
    class Config:
        extra = "forbid"

class ListingAttributesValidation(SQLModel):
    """Validierung für Listing-Attribute"""
    attributes: List[AttributeValue]
    
    class Config:
        extra = "forbid"
