from zoorl.common import (
    ApplicationException,
    ShortenedUrlModel,
    ShortenedUrlRepository,
    TimeToLiveThreshold,
    UrlShortenerServiceConfig
)
from zoorl.utils import compute_hash, compute_ttl

class ServiceException(ApplicationException):
    """Base exception for this application"""
    pass

class NoUrlSpecifiedException(ServiceException):
    """No URL was specified when asking for a short URL"""
    pass

class NoAliasSpecifiedException(ServiceException):
    """No alias was specified when asking for the associated long URL"""
    pass

class AliasIsUnknownException(ServiceException):
    """"An alias was specified but it is unknown to the system, either invalid or expired"""
    pass

class UrlShortenerService:
    def __init__(self, repository: ShortenedUrlRepository, config: UrlShortenerServiceConfig) -> None:
        self.repository = repository
        self.config = config

    def shorten_url(self, long_url: str, ttl_threshold: TimeToLiveThreshold=TimeToLiveThreshold.ONE_DAY) -> str:
        """Creates and save an alias for the specified URL that can be then used for creating the shortened URL"""
        if not long_url:
            raise NoUrlSpecifiedException()

        alias = compute_hash(long_url)
        ttl = compute_ttl(ttl_threshold)

        # We overwrite any pre-existing URL, this is by design to keep the use case simple :)
        shortened_url = ShortenedUrlModel(long_url, alias, ttl)
        self.repository.save(shortened_url)

        return alias

    def get_long_url_by_alias(self, alias: str) -> str:
        """Returns the URL associated with a given alias"""
        if not alias:
            raise NoAliasSpecifiedException("Requested alias cannot be empty!")

        # TODO Use regex to check that alias is created according to a given format,
        # before querying for its presence

        long_url = self.repository.get_by_alias(alias)

        if not long_url:
            raise AliasIsUnknownException(f"Alias '{alias}' is unknown or expired!")

        return long_url
