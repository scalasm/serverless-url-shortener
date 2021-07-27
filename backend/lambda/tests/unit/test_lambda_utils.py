import pytest

from zoorl.lambda_utils import to_json_response

to_json_response_test_data = [
    ({"message":"test"}, 200, None, 
    {
        "statusCode": 200, 
        "headers": {"Content-Type": "application/json"}, 
        "body": "{\"message\": \"test\"}" 
    }),
]

@pytest.mark.parametrize("body,http_status_code,headers,expected_response", to_json_response_test_data)
def test_to_json_response(body: dict, http_status_code: int, headers: dict, expected_response: dict) -> str:
    response = to_json_response(body, http_status_code, headers)

    assert response == expected_response
