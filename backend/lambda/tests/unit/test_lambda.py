import pytest
from pytest_mock import MockerFixture

import zoorl.lambda_utils as lambda_utils

TEST_TABLE_NAME = "test_table"
TEST_HOST_DOMAIN_PREFIX = "https://test.com"

handler_test_data = [
    ("GET", "handle_redirect"),
    ("POST", "handle_create_alias"),
]

@pytest.mark.parametrize("httpMethod,expected_handle_function_name", handler_test_data)
def test_should_redirect_to_correct_handler_functions(mocker: MockerFixture, monkeypatch, httpMethod: str, expected_handle_function_name: str) -> None:
    monkeypatch.setenv("URLS_TABLE", TEST_TABLE_NAME)
    monkeypatch.setenv("HOST_DOMAIN_PREFIX", TEST_HOST_DOMAIN_PREFIX)

    # Importing here, to allow monkeypatch to set the environment vars before they are requested
    import zoorl.lambda_port as lambda_port

    event = {
        "httpMethod": httpMethod,

    }
    context = {}

    mock_handle_function = mocker.patch.object(lambda_port, expected_handle_function_name, return_value={})

    lambda_port.handler(event, context)

    mock_handle_function.assert_called_once()
