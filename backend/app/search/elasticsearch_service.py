"""
Elasticsearch Service für Full-Text Search
"""
import logging
from typing import Dict, List, Any, Optional, Union
from elasticsearch import Elasticsearch, exceptions
from config import config
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class ElasticsearchService:
    """
    Elasticsearch-Service für erweiterte Suchfunktionen
    """
    
    def __init__(self):
        """Initialisiere Elasticsearch-Client"""
        self.client = None
        self.is_available = False
        
        if not config.ELASTICSEARCH_ENABLED:
            logger.info("Elasticsearch ist deaktiviert")
            return
            
        try:
            # Elasticsearch-Client initialisieren
            es_config = {
                "hosts": [config.ELASTICSEARCH_URL],
                "timeout": config.ELASTICSEARCH_TIMEOUT,
                "max_retries": config.ELASTICSEARCH_MAX_RETRIES,
                "retry_on_timeout": True
            }
            
            # Authentifizierung nur wenn konfiguriert
            if config.ELASTICSEARCH_USERNAME and config.ELASTICSEARCH_PASSWORD:
                es_config["basic_auth"] = (config.ELASTICSEARCH_USERNAME, config.ELASTICSEARCH_PASSWORD)
                es_config["verify_certs"] = False
                es_config["ssl_show_warn"] = False
            
            self.client = Elasticsearch(**es_config)
            
            # Test-Verbindung
            if self.client.ping():
                self.is_available = True
                logger.info("✅ Elasticsearch-Verbindung erfolgreich hergestellt")
                self._ensure_indices_exist()
            else:
                logger.error("❌ Elasticsearch-Verbindung fehlgeschlagen")
                
        except Exception as e:
            logger.error(f"❌ Elasticsearch-Initialisierungsfehler: {e}")
            self.client = None
            self.is_available = False
    
    def _ensure_indices_exist(self):
        """Stelle sicher, dass die benötigten Indizes existieren"""
        if not self.is_available:
            return
            
        try:
            # Listings-Index erstellen
            if not self.client.indices.exists(index=config.ELASTICSEARCH_INDEX_LISTINGS):
                self._create_listings_index()
                
            # Users-Index erstellen
            if not self.client.indices.exists(index=config.ELASTICSEARCH_INDEX_USERS):
                self._create_users_index()
                
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Indizes: {e}")
    
    def _create_listings_index(self):
        """Erstelle Listings-Index mit Mapping"""
        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "integer"},
                    "title": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "description": {
                        "type": "text",
                        "analyzer": "german"
                    },
                    "category": {"type": "keyword"},
                    "condition": {"type": "keyword"},
                    "location": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "price": {"type": "float"},
                    "attributes": {"type": "object"},
                    "status": {"type": "keyword"},
                    "views": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "search_text": {
                        "type": "text",
                        "analyzer": "german"
                    }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "german": {
                            "type": "standard",
                            "stopwords": "_german_"
                        }
                    }
                }
            }
        }
        
        self.client.indices.create(
            index=config.ELASTICSEARCH_INDEX_LISTINGS,
            body=mapping
        )
        logger.info(f"✅ Listings-Index erstellt: {config.ELASTICSEARCH_INDEX_LISTINGS}")
    
    def _create_users_index(self):
        """Erstelle Users-Index mit Mapping"""
        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "integer"},
                    "email": {"type": "keyword"},
                    "first_name": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "last_name": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "display_name": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "bio": {
                        "type": "text",
                        "analyzer": "german"
                    },
                    "location": {
                        "type": "text",
                        "analyzer": "german",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "role": {"type": "keyword"},
                    "verification_state": {"type": "keyword"},
                    "created_at": {"type": "date"},
                    "search_text": {
                        "type": "text",
                        "analyzer": "german"
                    }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            }
        }
        
        self.client.indices.create(
            index=config.ELASTICSEARCH_INDEX_USERS,
            body=mapping
        )
        logger.info(f"✅ Users-Index erstellt: {config.ELASTICSEARCH_INDEX_USERS}")
    
    def index_listing(self, listing_data: Dict[str, Any]) -> bool:
        """Indexiere ein Listing in Elasticsearch"""
        if not self.is_available:
            return False
            
        try:
            # Suchtext zusammenstellen
            search_text = f"{listing_data.get('title', '')} {listing_data.get('description', '')} {listing_data.get('location', '')}"
            
            # Dokument für Elasticsearch vorbereiten
            doc = {
                "id": listing_data.get("id"),
                "title": listing_data.get("title", ""),
                "description": listing_data.get("description", ""),
                "category": listing_data.get("category", ""),
                "condition": listing_data.get("condition", ""),
                "location": listing_data.get("location", ""),
                "price": listing_data.get("price", 0),
                "attributes": listing_data.get("attributes", {}),
                "status": listing_data.get("status", "ACTIVE"),
                "views": listing_data.get("views", 0),
                "user_id": listing_data.get("user_id"),
                "created_at": listing_data.get("created_at"),
                "updated_at": listing_data.get("updated_at"),
                "search_text": search_text
            }
            
            # In Elasticsearch indexieren
            self.client.index(
                index=config.ELASTICSEARCH_INDEX_LISTINGS,
                id=listing_data.get("id"),
                body=doc
            )
            
            logger.debug(f"Listing {listing_data.get('id')} in Elasticsearch indexiert")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Indexieren des Listings {listing_data.get('id')}: {e}")
            return False
    
    def index_user(self, user_data: Dict[str, Any]) -> bool:
        """Indexiere einen User in Elasticsearch"""
        if not self.is_available:
            return False
            
        try:
            # Suchtext zusammenstellen
            search_text = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')} {user_data.get('display_name', '')} {user_data.get('bio', '')} {user_data.get('location', '')}"
            
            # Dokument für Elasticsearch vorbereiten
            doc = {
                "id": user_data.get("id"),
                "email": user_data.get("email", ""),
                "first_name": user_data.get("first_name", ""),
                "last_name": user_data.get("last_name", ""),
                "display_name": user_data.get("display_name", ""),
                "bio": user_data.get("bio", ""),
                "location": user_data.get("location", ""),
                "role": user_data.get("role", ""),
                "verification_state": user_data.get("verification_state", ""),
                "created_at": user_data.get("created_at"),
                "search_text": search_text
            }
            
            # In Elasticsearch indexieren
            self.client.index(
                index=config.ELASTICSEARCH_INDEX_USERS,
                id=user_data.get("id"),
                body=doc
            )
            
            logger.debug(f"User {user_data.get('id')} in Elasticsearch indexiert")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Indexieren des Users {user_data.get('id')}: {e}")
            return False
    
    def search_listings(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """Erweiterte Suche nach Listings mit Elasticsearch"""
        if not self.is_available:
            return {"error": "Elasticsearch nicht verfügbar"}
        
        try:
            # Elasticsearch-Query zusammenstellen
            es_query = self._build_listings_query(query_params)
            
            # Suche ausführen
            response = self.client.search(
                index=config.ELASTICSEARCH_INDEX_LISTINGS,
                body=es_query
            )
            
            # Ergebnisse formatieren
            results = self._format_search_results(response, "listing")
            
            logger.info(f"Elasticsearch-Suche: {results['total']} Ergebnisse für Query: {query_params.get('q', '')}")
            return results
            
        except Exception as e:
            logger.error(f"Elasticsearch-Suchfehler: {e}")
            return {"error": str(e)}
    
    def search_users(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """Erweiterte Suche nach Users mit Elasticsearch"""
        if not self.is_available:
            return {"error": "Elasticsearch nicht verfügbar"}
        
        try:
            # Elasticsearch-Query zusammenstellen
            es_query = self._build_users_query(query_params)
            
            # Suche ausführen
            response = self.client.search(
                index=config.ELASTICSEARCH_INDEX_USERS,
                body=es_query
            )
            
            # Ergebnisse formatieren
            results = self._format_search_results(response, "user")
            
            logger.info(f"Elasticsearch-User-Suche: {results['total']} Ergebnisse für Query: {query_params.get('q', '')}")
            return results
            
        except Exception as e:
            logger.error(f"Elasticsearch-User-Suchfehler: {e}")
            return {"error": str(e)}
    
    def _build_listings_query(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Baue Elasticsearch-Query für Listings"""
        query = {
            "query": {
                "bool": {
                    "must": [],
                    "filter": []
                }
            },
            "sort": [],
            "from": params.get("offset", 0),
            "size": params.get("limit", 20)
        }
        
        # Textsuche
        if params.get("q"):
            query["query"]["bool"]["must"].append({
                "multi_match": {
                    "query": params["q"],
                    "fields": ["title^3", "description^2", "location^2", "search_text"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })
        
        # Filter
        if params.get("category"):
            query["query"]["bool"]["filter"].append({
                "term": {"category": params["category"]}
            })
        
        if params.get("condition"):
            query["query"]["bool"]["filter"].append({
                "term": {"condition": params["condition"]}
            })
        
        if params.get("location"):
            query["query"]["bool"]["filter"].append({
                "wildcard": {"location": f"*{params['location']}*"}
            })
        
        if params.get("price_min") is not None or params.get("price_max") is not None:
            price_range = {}
            if params.get("price_min") is not None:
                price_range["gte"] = params["price_min"]
            if params.get("price_max") is not None:
                price_range["lte"] = params["price_max"]
            
            query["query"]["bool"]["filter"].append({
                "range": {"price": price_range}
            })
        
        # Nur aktive Listings
        query["query"]["bool"]["filter"].append({
            "term": {"status": "ACTIVE"}
        })
        
        # Sortierung
        sort_by = params.get("sort_by", "relevance")
        sort_order = params.get("sort_order", "desc")
        
        if sort_by == "price":
            query["sort"].append({"price": {"order": sort_order}})
        elif sort_by == "date":
            query["sort"].append({"created_at": {"order": sort_order}})
        elif sort_by == "views":
            query["sort"].append({"views": {"order": sort_order}})
        else:  # relevance
            query["sort"].append("_score")
            query["sort"].append({"created_at": {"order": "desc"}})
        
        return query
    
    def _build_users_query(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Baue Elasticsearch-Query für Users"""
        query = {
            "query": {
                "bool": {
                    "must": [],
                    "filter": []
                }
            },
            "sort": [],
            "from": params.get("offset", 0),
            "size": params.get("limit", 20)
        }
        
        # Textsuche
        if params.get("q"):
            query["query"]["bool"]["must"].append({
                "multi_match": {
                    "query": params["q"],
                    "fields": ["display_name^3", "first_name^2", "last_name^2", "bio", "search_text"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })
        
        # Filter
        if params.get("role"):
            query["query"]["bool"]["filter"].append({
                "term": {"role": params["role"]}
            })
        
        if params.get("verification_state"):
            query["query"]["bool"]["filter"].append({
                "term": {"verification_state": params["verification_state"]}
            })
        
        if params.get("location"):
            query["query"]["bool"]["filter"].append({
                "wildcard": {"location": f"*{params['location']}*"}
            })
        
        # Sortierung
        sort_by = params.get("sort_by", "relevance")
        sort_order = params.get("sort_order", "desc")
        
        if sort_by == "date":
            query["sort"].append({"created_at": {"order": sort_order}})
        else:  # relevance
            query["sort"].append("_score")
            query["sort"].append({"created_at": {"order": "desc"}})
        
        return query
    
    def _format_search_results(self, response: Dict[str, Any], result_type: str) -> Dict[str, Any]:
        """Formatiere Elasticsearch-Suchergebnisse"""
        hits = response.get("hits", {})
        total = hits.get("total", {}).get("value", 0)
        
        results = []
        for hit in hits.get("hits", []):
            source = hit.get("_source", {})
            source["_score"] = hit.get("_score", 0)
            results.append(source)
        
        return {
            "results": results,
            "total": total,
            "took": response.get("took", 0),
            "type": result_type
        }
    
    def delete_listing(self, listing_id: int) -> bool:
        """Lösche Listing aus Elasticsearch"""
        if not self.is_available:
            return False
            
        try:
            self.client.delete(
                index=config.ELASTICSEARCH_INDEX_LISTINGS,
                id=listing_id
            )
            logger.debug(f"Listing {listing_id} aus Elasticsearch gelöscht")
            return True
            
        except exceptions.NotFoundError:
            logger.debug(f"Listing {listing_id} nicht in Elasticsearch gefunden")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Löschen des Listings {listing_id}: {e}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Lösche User aus Elasticsearch"""
        if not self.is_available:
            return False
            
        try:
            self.client.delete(
                index=config.ELASTICSEARCH_INDEX_USERS,
                id=user_id
            )
            logger.debug(f"User {user_id} aus Elasticsearch gelöscht")
            return True
            
        except exceptions.NotFoundError:
            logger.debug(f"User {user_id} nicht in Elasticsearch gefunden")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Löschen des Users {user_id}: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Hole Elasticsearch-Statistiken"""
        if not self.is_available:
            return {"status": "unavailable", "error": "Elasticsearch nicht verfügbar"}
        
        try:
            # Cluster-Info
            cluster_health = self.client.cluster.health()
            cluster_stats = self.client.cluster.stats()
            
            # Index-Statistiken
            listings_stats = self.client.indices.stats(index=config.ELASTICSEARCH_INDEX_LISTINGS)
            users_stats = self.client.indices.stats(index=config.ELASTICSEARCH_INDEX_USERS)
            
            return {
                "status": "available",
                "cluster_health": cluster_health.get("status"),
                "cluster_name": cluster_health.get("cluster_name"),
                "number_of_nodes": cluster_health.get("number_of_nodes"),
                "listings_index": {
                    "doc_count": listings_stats.get("_all", {}).get("total", {}).get("docs", {}).get("count", 0),
                    "size": listings_stats.get("_all", {}).get("total", {}).get("store", {}).get("size_in_bytes", 0)
                },
                "users_index": {
                    "doc_count": users_stats.get("_all", {}).get("total", {}).get("docs", {}).get("count", 0),
                    "size": users_stats.get("_all", {}).get("total", {}).get("store", {}).get("size_in_bytes", 0)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Elasticsearch-Statistiken: {e}")
            return {"status": "error", "error": str(e)}

# Globale Elasticsearch-Instanz
elasticsearch_service = ElasticsearchService()
