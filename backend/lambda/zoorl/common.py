from abc import ABC, abstractmethod
from enum import Enum

class ShortenedUrlModel:
    """Data model for Shortened URLs"""
    def __init__(self, long_url: str, alias: str, ttl: int) -> None:
        self.long_url = long_url
        self.alias = alias
        self.ttl = ttl

class TimeToLiveThreshold(Enum):
    """Supported TTL thresholds"""
    ONE_DAY = 1
    ONE_WEEK = 2
    ONE_MONTH = 3

class ApplicationException(Exception):
    pass

class ShortenedUrlRepository(ABC):
    """Interface for repository implementations"""
    @abstractmethod
    def save(self, shortened_url: ShortenedUrlModel) -> None:
        """Save the model to database"""
        pass

    @abstractmethod
    def get_by_alias(self, alias: str) -> str:
        """Returns the alias for the given alias"""
        pass
class ShortenedUrlRepositoryException(ApplicationException):
    """Exception throws because of the errors in the repository layer"""
    pass

class UrlShortenerServiceConfig:
    """Well-known configuration options for the URL Shortener service"""
    def __init__(self, host_domain_base: str) -> None:
        self.host_domain_base = host_domain_base

