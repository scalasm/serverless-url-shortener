from abc import ABC, abstractmethod

import boto3
import os

class ShortenedUrlModel:
    """Data model for Shortened URLs"""
    def __init__(self, long_url: str, alias: str, ttl: int) -> None:
        self.long_url = long_url
        self.alias = alias
        self.ttl = ttl

class ApplicationException(Exception):
    """Base class for all application exception"""
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

class RepositoryException(ApplicationException):
    """Exception throws because of the errors in the repository layer"""
    pass

class ApplicationConfig:
    """Well-known configuration options for the URL Shortener service"""
    def __init__(self) -> None:
        self.__dynamodb_client = None
        self.__urls_table = None

    def get_env(self, env_var: str, default_value: str = None) -> str:
        return os.environ.get(env_var, default_value)

    # Get the service resource.
    @property
    def dynamodb_client(self):
        if not self.__dynamodb_client:
            self.__dynamodb_client = boto3.resource("dynamodb")
        return self.__dynamodb_client

    @property
    def urls_table(self):
        if not self.__urls_table:
            table_name = self.get_env("URLS_TABLE")
            self.__urls_table = self.dynamodb_client.Table(table_name)
        return self.__urls_table
