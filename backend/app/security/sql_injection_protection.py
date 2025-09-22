"""
SQL Injection Protection für sichere Datenbankabfragen
"""
import re
from sqlmodel import Session, select, text
from sqlalchemy.orm import joinedload
from typing import Any, Dict, List, Optional, Union
import logging

logger = logging.getLogger(__name__)

class SQLInjectionProtection:
    """Schutz vor SQL Injection durch parametrisierte Queries"""
    
    @staticmethod
    def safe_json_filter(
        session: Session, 
        model_class: Any, 
        attribute_name: str, 
        value: Any, 
        operator: str = "equals"
    ) -> Any:
        """Sichere JSON-Attribut-Filterung ohne SQL Injection"""
        
        # Input-Validierung
        if not attribute_name or value is None:
            return session.query(model_class)
        
        # Sichere Attribut-Namen-Validierung
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', attribute_name):
            logger.warning(f"Ungültiger Attribut-Name: {attribute_name}")
            raise ValueError("Ungültiger Attribut-Name")
        
        # Parametrisierte Query basierend auf Operator
        if operator == "equals":
            if isinstance(value, str):
                # Sichere String-Suche mit Parametern
                query = session.query(model_class).filter(
                    model_class.attributes.contains(f'"{attribute_name}": "{value}"')
                )
            else:
                # Sichere numerische Suche
                query = session.query(model_class).filter(
                    model_class.attributes.contains(f'"{attribute_name}": {value}')
                )
        
        elif operator == "contains":
            # Sichere Contains-Suche
            query = session.query(model_class).filter(
                model_class.attributes.contains(f'"{attribute_name}": "{value}"')
            )
        
        elif operator == "range_min":
            # Sichere Range-Min-Suche
            if not isinstance(value, (int, float)):
                raise ValueError("Range-Min-Wert muss numerisch sein")
            query = session.query(model_class).filter(
                model_class.attributes.contains(f'"{attribute_name}": {value}')
            )
        
        elif operator == "range_max":
            # Sichere Range-Max-Suche
            if not isinstance(value, (int, float)):
                raise ValueError("Range-Max-Wert muss numerisch sein")
            query = session.query(model_class).filter(
                model_class.attributes.contains(f'"{attribute_name}": {value}')
            )
        
        else:
            raise ValueError(f"Unbekannter Operator: {operator}")
        
        return query
    
    @staticmethod
    def safe_text_search(
        session: Session, 
        model_class: Any, 
        search_term: str, 
        search_fields: List[str]
    ) -> Any:
        """Sichere Text-Suche ohne SQL Injection"""
        
        if not search_term or not search_fields:
            return session.query(model_class)
        
        # Input-Sanitization
        search_term = search_term.strip()
        if len(search_term) < 2:
            return session.query(model_class)
        
        # Sichere LIKE-Queries mit Parametern
        conditions = []
        for field in search_fields:
            if hasattr(model_class, field):
                # Parametrisierte LIKE-Query
                conditions.append(
                    getattr(model_class, field).ilike(f"%{search_term}%")
                )
        
        if conditions:
            from sqlalchemy import or_
            return session.query(model_class).filter(or_(*conditions))
        
        return session.query(model_class)
    
    @staticmethod
    def safe_raw_sql(session: Session, sql_query: str, params: Dict[str, Any] = None) -> Any:
        """Sichere Raw SQL-Queries mit Parametern"""
        
        if not sql_query:
            raise ValueError("SQL-Query darf nicht leer sein")
        
        # Gefährliche SQL-Keywords prüfen
        dangerous_keywords = [
            'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 
            'EXEC', 'EXECUTE', 'UNION', 'SCRIPT'
        ]
        
        sql_upper = sql_query.upper()
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                logger.warning(f"Gefährliches SQL-Keyword erkannt: {keyword}")
                raise ValueError(f"Gefährliches SQL-Keyword nicht erlaubt: {keyword}")
        
        try:
            # Parametrisierte Query ausführen
            if params:
                result = session.execute(text(sql_query), params)
            else:
                result = session.execute(text(sql_query))
            
            return result
            
        except Exception as e:
            logger.error(f"SQL-Query-Fehler: {e}")
            raise ValueError(f"SQL-Query-Fehler: {e}")
    
    @staticmethod
    def safe_pagination(
        query: Any, 
        page: int = 1, 
        page_size: int = 20, 
        max_page_size: int = 100
    ) -> Any:
        """Sichere Paginierung mit Validierung"""
        
        # Input-Validierung
        if page < 1:
            page = 1
        
        if page_size < 1:
            page_size = 20
        
        if page_size > max_page_size:
            page_size = max_page_size
        
        # Sichere Paginierung
        offset = (page - 1) * page_size
        return query.offset(offset).limit(page_size)
    
    @staticmethod
    def safe_ordering(
        query: Any, 
        order_by: str, 
        allowed_fields: List[str], 
        direction: str = "asc"
    ) -> Any:
        """Sichere Sortierung mit Feld-Validierung"""
        
        if not order_by or order_by not in allowed_fields:
            return query
        
        if direction.lower() not in ["asc", "desc"]:
            direction = "asc"
        
        # Sichere Sortierung
        field = getattr(query.column_descriptions[0]['entity'], order_by)
        if direction.lower() == "desc":
            return query.order_by(field.desc())
        else:
            return query.order_by(field.asc())
    
    @staticmethod
    def safe_join_loading(query: Any, relationships: List[str]) -> Any:
        """Sichere Eager Loading ohne N+1 Problem"""
        
        if not relationships:
            return query
        
        # Validierte Relationships
        valid_relationships = []
        for rel in relationships:
            if hasattr(query.column_descriptions[0]['entity'], rel):
                valid_relationships.append(rel)
        
        # Sichere joinedload
        if valid_relationships:
            for rel in valid_relationships:
                query = query.options(joinedload(getattr(query.column_descriptions[0]['entity'], rel)))
        
        return query
