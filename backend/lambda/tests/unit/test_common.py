from unittest.mock import MagicMock
import pytest
from pytest_mock import MockerFixture

import boto3
import os

from zoorl.common import (
    ShortenedUrlModel,
    ApplicationConfig
)


class TestShortenedUrlModel:
    def test_init(self) -> None:
        model = ShortenedUrlModel("https://long.url", "test_alias", 15)

        assert model.long_url == "https://long.url"
        assert model.alias == "test_alias"
        assert model.ttl == 15

class TestUrlShortenerServiceConfig:

    @pytest.fixture
    def service_config(self) -> ApplicationConfig:
        return ApplicationConfig()

    get_env_test_data = [
        ("__TEST_SALUTE__", "HELLO"),
    ]

    @pytest.mark.parametrize("var_name,var_value", get_env_test_data)
    def test_get_env(self, monkeypatch, service_config: ApplicationConfig, var_name: str, var_value: str) -> None:
        monkeypatch.setenv(var_name, var_value)

        assert service_config.get_env(var_name) == var_value

    def test_get_env_not_existing(self, service_config: ApplicationConfig) -> None:
        assert service_config.get_env("__I_DONT_EXIST__") == None
        assert service_config.get_env("__I_DONT_EXIST__", "my_default") == "my_default"

    def test_dynamodb_client_property(self, mocker: MockerFixture, service_config: ApplicationConfig) -> None:
        mock_dynamodb_client = MagicMock()
        mock_resource = mocker.patch.object(boto3, "resource", return_value=mock_dynamodb_client)

        first_client = service_config.dynamodb_client()
        second_client = service_config.dynamodb_client()
        mock_resource.assert_called_once_with("dynamodb") 

        assert first_client == second_client

    
    def test_urls_table_property(self, monkeypatch, mocker: MockerFixture) -> None:
        mock_get_env = mocker.patch("zoorl.common.ApplicationConfig.get_env", return_value="test_table_name")
        mock_dynamodb_client = MagicMock()
        mock_dynamodb_client_property = mocker.PropertyMock(return_value=mock_dynamodb_client)

        mock_table = MagicMock()
        mock_dynamodb_client_property.Table.return_value = mock_table

        ApplicationConfig.dynamodb_client = mock_dynamodb_client_property(return_value = mock_dynamodb_client_property)

        service_config = ApplicationConfig()

        first_table = service_config.urls_table()
        second_table = service_config.urls_table()
        
        mock_get_env.assert_called_once()
        mock_dynamodb_client_property.assert_called_once() 

        assert first_table == second_table
