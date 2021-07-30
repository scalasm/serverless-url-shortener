import pytest

from typing import Optional, Any

from zoorl.lambda_utils import (
    get_path_parameter,
    get_json_body,
    to_json_response
)

to_json_response_test_data = [
    ({"message":"test"}, 200, None, 
    {
        "statusCode": 200, 
        "headers": {"Content-Type": "application/json"}, 
        "body": "{\"message\": \"test\"}" 
    }),
    ({"message":"test"}, 200, {"x-test-header": "test"}, 
    {
        "statusCode": 200, 
        "headers": {"Content-Type": "application/json", "x-test-header": "test"}, 
        "body": "{\"message\": \"test\"}" 
    }),
]

@pytest.mark.parametrize("body,http_status_code,headers,expected_response", to_json_response_test_data)
def test_to_json_response(body: dict, http_status_code: int, headers: dict, expected_response: dict) -> None:
    response = to_json_response(body, http_status_code, headers)

    assert response == expected_response


TEST_EVENT = {
    "pathParameters": {
        "param": "test"
    }
}

get_path_parameter_test_data = [
    (TEST_EVENT, "param", None, "test"),
    (TEST_EVENT, "not_present_param", "something", "something"),
    ({ }, "param", "something", "something"),
]

@pytest.mark.parametrize("event,param_name,default_value,expected_response", get_path_parameter_test_data)
def test_get_path_parameter(event: dict, param_name: str, default_value: str, expected_response: Optional[str]) -> None:
    assert get_path_parameter(event, param_name, default_value) == expected_response

get_json_body_test_data = [
    ({"body": "{\"message\": \"test\"}" }, {"message": "test"}),
    ({ }, None),
]

@pytest.mark.parametrize("event,expected_json_object", get_json_body_test_data)
def test_get_json_body(event: dict, expected_json_object: dict) -> None:
    assert get_json_body(event) == expected_json_object
