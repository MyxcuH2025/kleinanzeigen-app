"""
Unit-Tests für Caching-System
"""
import pytest
import time
from unittest.mock import Mock, patch

from app.cache.redis_service import RedisCacheService
from app.cache.decorators import cache_listings, CacheManager

class TestRedisCacheService:
    """Tests für Redis Cache Service"""
    
    def test_redis_cache_initialization(self):
        """Test Redis Cache Initialisierung"""
        with patch('app.cache.redis_service.redis') as mock_redis:
            mock_redis.from_url.return_value.ping.return_value = True
            
            cache = RedisCacheService()
            assert cache.is_available() == True
    
    def test_redis_cache_unavailable(self):
        """Test Redis Cache nicht verfügbar"""
        with patch('app.cache.redis_service.redis') as mock_redis:
            mock_redis.from_url.side_effect = Exception("Connection failed")
            
            cache = RedisCacheService()
            assert cache.is_available() == False
    
    def test_cache_set_get(self, mock_redis):
        """Test Cache SET und GET Operationen"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        # Test SET
        result = cache.set("test_key", "test_value", 60)
        assert result == True
        mock_redis.set.assert_called_once()
        
        # Test GET
        mock_redis.get.return_value = b'"test_value"'
        value = cache.get("test_key")
        assert value == "test_value"
    
    def test_cache_delete(self, mock_redis):
        """Test Cache DELETE Operation"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        mock_redis.delete.return_value = 1
        result = cache.delete("test_key")
        assert result == True
        mock_redis.delete.assert_called_once_with("test_key")
    
    def test_cache_delete_not_found(self, mock_redis):
        """Test Cache DELETE für nicht existierenden Schlüssel"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        mock_redis.delete.return_value = 0
        result = cache.delete("nonexistent_key")
        assert result == False
    
    def test_cache_get_or_set(self, mock_redis):
        """Test Cache GET_OR_SET Operation"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        # Cache MISS - Callback wird aufgerufen
        mock_redis.get.return_value = None
        mock_redis.set.return_value = True
        
        def callback():
            return "callback_result"
        
        result = cache.get_or_set("test_key", callback, 60)
        assert result == "callback_result"
        mock_redis.set.assert_called_once()
        
        # Cache HIT - Callback wird nicht aufgerufen
        mock_redis.get.return_value = b'"cached_result"'
        result = cache.get_or_set("test_key", callback, 60)
        assert result == "cached_result"
    
    def test_cache_serialization(self, mock_redis):
        """Test Cache Serialisierung/Deserialisierung"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        # Test JSON-Serialisierung
        test_data = {"key": "value", "number": 123}
        result = cache.set("json_key", test_data, 60)
        assert result == True
        
        mock_redis.get.return_value = b'{"key": "value", "number": 123}'
        retrieved = cache.get("json_key")
        assert retrieved == test_data
    
    def test_cache_pattern_delete(self, mock_redis):
        """Test Cache Pattern DELETE"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        mock_redis.keys.return_value = [b"listings:1", b"listings:2"]
        mock_redis.delete.return_value = 2
        
        result = cache.delete_pattern("listings:*")
        assert result == 2
        mock_redis.keys.assert_called_once_with("listings:*")
        mock_redis.delete.assert_called_once_with(b"listings:1", b"listings:2")

class TestCacheDecorators:
    """Tests für Cache-Dekoratoren"""
    
    def test_cache_decorator_cache_hit(self, mock_redis):
        """Test Cache-Dekorator mit Cache HIT"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        cache.is_available = Mock(return_value=True)
        
        # Mock Cache HIT
        mock_redis.get.return_value = b'"cached_result"'
        
        @cache_listings(ttl=300)
        def test_function():
            return "fresh_result"
        
        result = test_function()
        assert result == "cached_result"
    
    def test_cache_decorator_cache_miss(self, mock_redis):
        """Test Cache-Dekorator mit Cache MISS"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        cache.is_available = Mock(return_value=True)
        
        # Mock Cache MISS
        mock_redis.get.return_value = None
        mock_redis.set.return_value = True
        
        @cache_listings(ttl=300)
        def test_function():
            return "fresh_result"
        
        result = test_function()
        assert result == "fresh_result"
        mock_redis.set.assert_called_once()
    
    def test_cache_decorator_redis_unavailable(self, mock_redis):
        """Test Cache-Dekorator wenn Redis nicht verfügbar"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        cache.is_available = Mock(return_value=False)
        
        @cache_listings(ttl=300)
        def test_function():
            return "fresh_result"
        
        result = test_function()
        assert result == "fresh_result"
        # Redis sollte nicht aufgerufen werden
        mock_redis.get.assert_not_called()
        mock_redis.set.assert_not_called()
    
    def test_cache_decorator_error_handling(self, mock_redis):
        """Test Cache-Dekorator Fehlerbehandlung"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        cache.is_available = Mock(return_value=True)
        
        # Mock Redis-Fehler
        mock_redis.get.side_effect = Exception("Redis error")
        
        @cache_listings(ttl=300)
        def test_function():
            return "fresh_result"
        
        # Funktion sollte trotz Redis-Fehler funktionieren
        result = test_function()
        assert result == "fresh_result"

class TestCacheManager:
    """Tests für Cache Manager"""
    
    def test_invalidate_listings_cache(self, mock_redis):
        """Test Listings-Cache Invalidation"""
        with patch('app.cache.decorators.redis_cache') as mock_cache:
            mock_cache.delete_pattern.return_value = 5
            
            result = CacheManager.invalidate_listings_cache()
            assert result == 5
            mock_cache.delete_pattern.assert_called_once_with("listings:*")
    
    def test_invalidate_user_cache(self, mock_redis):
        """Test User-Cache Invalidation"""
        with patch('app.cache.decorators.redis_cache') as mock_cache:
            mock_cache.delete_pattern.return_value = 3
            
            result = CacheManager.invalidate_user_cache(user_id=123)
            assert result == 3
            mock_cache.delete_pattern.assert_called_once_with("users:*:123*")
    
    def test_invalidate_search_cache(self, mock_redis):
        """Test Search-Cache Invalidation"""
        with patch('app.cache.decorators.redis_cache') as mock_cache:
            mock_cache.delete_pattern.return_value = 10
            
            result = CacheManager.invalidate_search_cache()
            assert result == 10
            mock_cache.delete_pattern.assert_called_once_with("search:*")
    
    def test_get_cache_stats(self, mock_redis):
        """Test Cache-Statistiken"""
        with patch('app.cache.decorators.redis_cache') as mock_cache:
            mock_stats = {
                "status": "available",
                "hit_rate": 85.5,
                "memory_usage": "2.5MB"
            }
            mock_cache.get_stats.return_value = mock_stats
            
            stats = CacheManager.get_cache_stats()
            assert stats == mock_stats
    
    def test_clear_all_cache(self, mock_redis):
        """Test Alle Cache-Daten löschen"""
        with patch('app.cache.decorators.redis_cache') as mock_cache:
            mock_cache.clear_all.return_value = True
            
            result = CacheManager.clear_all_cache()
            assert result == True
            mock_cache.clear_all.assert_called_once()

class TestCachePerformance:
    """Tests für Cache-Performance"""
    
    def test_cache_performance_improvement(self, mock_redis):
        """Test Cache-Performance-Verbesserung"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        cache.is_available = Mock(return_value=True)
        
        # Simuliere langsame Funktion
        def slow_function():
            time.sleep(0.1)  # 100ms Verzögerung
            return "result"
        
        # Erster Aufruf - Cache MISS
        mock_redis.get.return_value = None
        mock_redis.set.return_value = True
        
        start_time = time.time()
        result = cache.get_or_set("perf_test", slow_function, 60)
        first_call_time = time.time() - start_time
        
        assert result == "result"
        assert first_call_time >= 0.1  # Mindestens 100ms
        
        # Zweiter Aufruf - Cache HIT
        mock_redis.get.return_value = b'"result"'
        
        start_time = time.time()
        result = cache.get_or_set("perf_test", slow_function, 60)
        second_call_time = time.time() - start_time
        
        assert result == "result"
        assert second_call_time < 0.01  # Viel schneller als 100ms
    
    def test_cache_memory_efficiency(self, mock_redis):
        """Test Cache-Speichereffizienz"""
        cache = RedisCacheService()
        cache.redis_client = mock_redis
        
        # Test mit großen Daten
        large_data = {"data": "x" * 10000}  # 10KB Daten
        
        mock_redis.set.return_value = True
        result = cache.set("large_key", large_data, 60)
        assert result == True
        
        # Verifikation dass Serialisierung funktioniert
        mock_redis.get.return_value = b'{"data": "' + b'x' * 10000 + b'"}'
        retrieved = cache.get("large_key")
        assert retrieved == large_data
