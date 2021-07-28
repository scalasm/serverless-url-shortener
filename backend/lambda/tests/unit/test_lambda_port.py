from unittest.mock import MagicMock
import pytest
from pytest_mock import MockerFixture

import json

import zoorl.lambda_utils as lambda_utils
import zoorl.lambda_port as lambda_port

TEST_TABLE_NAME = "test_table"

handler_test_data = [
    ("GET", "handle_redirect"),
    ("POST", "handle_create_alias"),
]

@pytest.mark.parametrize("httpMethod,expected_handle_function_name", handler_test_data)
def test_should_redirect_to_correct_handler_functions(mocker: MockerFixture, monkeypatch, httpMethod: str, expected_handle_function_name: str) -> None:
    monkeypatch.setenv("URLS_TABLE", TEST_TABLE_NAME)

    # Importing here, to allow monkeypatch to set the environment vars before they are requested

    event = {
        "httpMethod": httpMethod,
    }
    context = {}

    mock_handle_function = mocker.patch.object(lambda_port, expected_handle_function_name, return_value={})

    lambda_port.handler(event, context)

    mock_handle_function.assert_called_once()

# TODO Check for ApplicationExceptions

def test_handle_redirect(mocker) -> None:
    fake_alias = "abcd"
    fake_long_url = "https://fake"

    mock_event = MagicMock()
    mock_context = MagicMock()
    mock_service = MagicMock()

    mock_get_path_parameter = mocker.patch.object(lambda_utils, "get_path_parameter", return_value=fake_alias)
    mock_get_long_url_by_alias = mock_service.get_long_url_by_alias
    mock_get_long_url_by_alias.return_value = fake_long_url

    return_value = lambda_port.handle_redirect(mock_event, mock_context, mock_service)

    assert return_value["statusCode"] == 301
    assert return_value["headers"]["Location"] == fake_long_url

    mock_get_path_parameter.assert_called_once_with(mock_event, "alias")
    mock_get_long_url_by_alias.assert_called_once_with(fake_alias)


handle_create_alias_test_data = [
    ("https://fakelongurl.com/something", 5, "abcd"),
    ("https://fakelongurl.com/somethingelse", None, "kkkk"),
]

@pytest.mark.parametrize("fake_long_url,fake_ttl,fake_alias", handle_create_alias_test_data)
def test_handle_create_alias(mocker, fake_long_url, fake_ttl, fake_alias) -> None:
    json_body = {
        "url": fake_long_url,
    }
    if fake_ttl:
        json_body["ttl"] = fake_ttl
    
    mock_event = {
        "headers": {
            "X-Forwarded-Proto": "https"
        },
        "requestContext": {
            "domainName": "short.link",
            "path": "/prod",
        },
        "body": json.dumps(json_body)
    }
    mock_context = MagicMock()
    mock_service = MagicMock()

    mock_shorten_url = mock_service.shorten_url
    mock_shorten_url.return_value = fake_alias
    mocker.patch.object(lambda_utils, "get_json_body", return_value=json_body)

    return_value = lambda_port.handle_create_alias(mock_event, mock_context, mock_service)

    assert return_value["statusCode"] == 200
    assert return_value["headers"]["Content-Type"] == "application/json"

    mock_shorten_url.assert_called_once_with(fake_long_url, fake_ttl)

def test_handle_create_alias_not_existing(mocker) -> None:
    json_body = {
        "url": "https://fake_domain.com",
        "ttl": 1
    }
    mocker.patch.object(lambda_utils, "get_json_body", return_value=json_body)

    mock_event = MagicMock()
    mock_context = MagicMock()
    mock_service = MagicMock()

    mock_shorten_url = mock_service.shorten_url
    mock_shorten_url.side_effect = lambda_port.AliasIsUnknownException("No such alias")

    return_value = lambda_port.handle_create_alias(mock_event, mock_context, mock_service)

    assert return_value["statusCode"] == 404
    assert return_value["headers"]["Content-Type"] == "application/json"
    assert "No such alias" in return_value["body"]
