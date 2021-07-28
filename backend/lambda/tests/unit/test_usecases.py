from unittest.mock import MagicMock
import pytest
from pytest_mock import MockerFixture

import zoorl.utils as utils

from zoorl.common import (
    ApplicationConfig, 
    ShortenedUrlRepository
)

from zoorl.usecases import (
    UrlShortenerService,
    AliasIsUnknownException,
    NoAliasSpecifiedException,
    NoUrlSpecifiedException
)

class TestUrlShortenerService:

    @pytest.fixture
    def mock_application_config(self) -> ApplicationConfig:
        return MagicMock()

    @pytest.fixture
    def mock_repository(self) -> ShortenedUrlRepository:
        return MagicMock()

    @pytest.fixture
    def service(self, mock_repository, mock_application_config) -> UrlShortenerService:
        return UrlShortenerService(mock_repository, mock_application_config)

    no_alias_test_data = [
        (None),
        (""),
    ]

    @pytest.mark.parametrize("alias", no_alias_test_data)
    def test_get_long_url_by_alias__no_alias(self, service: UrlShortenerService, alias: str) -> None:
        with pytest.raises(NoAliasSpecifiedException):
            service.get_long_url_by_alias(alias)

    def test_get_long_url_by_alias__alias_is_unknown(self, service: UrlShortenerService, mock_repository: ShortenedUrlRepository) -> None:
        unknown_alias = "unknown"
        
        mock_repository.get_by_alias.return_value = None

        with pytest.raises(AliasIsUnknownException):
            service.get_long_url_by_alias(unknown_alias)
        
        mock_repository.get_by_alias.assert_called_once_with(unknown_alias)

    def test_get_long_url_by_alias(self, service: UrlShortenerService, mock_repository: ShortenedUrlRepository) -> None:
        alias = "unknown"
        long_url = "https://something.com/nicestuff.html"

        mock_repository.get_by_alias.return_value = long_url

        return_long_url = service.get_long_url_by_alias(alias)
        
        assert return_long_url == long_url
        mock_repository.get_by_alias.assert_called_once_with(alias)

    no_long_url_test_data = [
        (None),
        (""),
    ]

    @pytest.mark.parametrize("long_url", no_alias_test_data)
    def test_shorten_url__no_long_url(self, service: UrlShortenerService, long_url: str) -> None:
        with pytest.raises(NoUrlSpecifiedException):
            service.shorten_url(long_url, 10)

    def test_shorten_url(self, monkeypatch, mocker: MockerFixture, service: UrlShortenerService, mock_repository: ShortenedUrlRepository) -> None:
        fake_alias = "fake"
        fake_ttl = 100000000 # Fake Unix epoch time (does not make any sense, it's not important)
        
        long_url = "https://something.com/nicestuff.html"
        ttl = 1

        mock_compute_hash = mocker.patch.object(utils, "compute_hash", return_value=fake_alias)
        mock_compute_epoch_time_from_ttl = mocker.patch.object(utils, "compute_epoch_time_from_ttl", return_value=fake_ttl)

        mock_repository.save.return_value = None

        return_alias = service.shorten_url(long_url, ttl)
        
        mock_compute_hash.assert_called_once_with(long_url)
        mock_compute_epoch_time_from_ttl.assert_called_once_with(ttl)

        assert return_alias == fake_alias
        mock_repository.save.assert_called_once()
