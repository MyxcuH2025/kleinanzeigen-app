"""
Category models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship, Index
from typing import Optional, List
from datetime import datetime

class Category(SQLModel, table=True):
    """Hauptkategorien"""
    id: Optional[int] = Field(default=None, primary_key=True)
    value: str = Field(unique=True, index=True, max_length=100)  # z.B. "auto-rad-boot"
    label: str = Field(max_length=200)  # z.B. "Auto, Rad & Boot"
    icon: str = Field(max_length=10)  # z.B. "🚗"
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    subcategories: List["Subcategory"] = Relationship(back_populates="category")
    
    __table_args__ = (
        Index("idx_category_value", "value"),
        Index("idx_category_active", "is_active"),
        Index("idx_category_sort", "sort_order"),
    )

class Subcategory(SQLModel, table=True):
    """Unterkategorien"""
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id")
    value: str = Field(max_length=100)  # z.B. "autos"
    label: str = Field(max_length=200)  # z.B. "Autos"
    icon: Optional[str] = Field(default=None, max_length=10)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    category: Category = Relationship(back_populates="subcategories")
    
    __table_args__ = (
        Index("idx_subcategory_category", "category_id"),
        Index("idx_subcategory_value", "value"),
        Index("idx_subcategory_active", "is_active"),
        Index("idx_subcategory_sort", "sort_order"),
    )

class CategoryItem(SQLModel, table=True):
    """Kategorie-Items (z.B. "BMW", "Mercedes" für Autos)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    subcategory_id: int = Field(foreign_key="subcategory.id")
    value: str = Field(max_length=100)  # z.B. "bmw"
    label: str = Field(max_length=200)  # z.B. "BMW"
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    subcategory: Subcategory = Relationship()
    
    __table_args__ = (
        Index("idx_categoryitem_subcategory", "subcategory_id"),
        Index("idx_categoryitem_value", "value"),
        Index("idx_categoryitem_active", "is_active"),
    )

# Request/Response Models für Categories
class CategoryCreate(SQLModel):
    """Request-Model für Category-Erstellung"""
    value: str
    label: str
    icon: str
    description: Optional[str] = None
    sort_order: int = 0

class CategoryUpdate(SQLModel):
    """Request-Model für Category-Update"""
    label: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class CategoryResponse(SQLModel):
    """Response-Model für Category"""
    id: int
    value: str
    label: str
    icon: str
    description: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

class SubcategoryCreate(SQLModel):
    """Request-Model für Subcategory-Erstellung"""
    category_id: int
    value: str
    label: str
    icon: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0

class SubcategoryResponse(SQLModel):
    """Response-Model für Subcategory"""
    id: int
    category_id: int
    value: str
    label: str
    icon: Optional[str]
    description: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

class CategoryWithSubcategories(CategoryResponse):
    """Category mit Subcategories"""
    subcategories: List[SubcategoryResponse] = []
