
import json
from typing import Optional, Any

def get_path_parameter(event, param_name: str, default_value: str = "") -> Optional[str]:
    """Returns the value for the specified path parameter or the 'default_value' if not found"""
    map = event.get("pathParameters")
    if map:
        return map.get(param_name, default_value)

    return default_value

def get_json_body(event) -> Optional[Any]:
    """Return the body as JSON object, if present; otherwise it will return None"""
    body = event.get("body")
    if body:
        return json.loads(body)
    return None

def to_json_response(object_body: Any, http_status_code: int = 200, headers = None) -> str:
    json_response = {
        "statusCode": http_status_code,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(object_body)
    }

    if headers:
        json_response["headers"].update(headers)
    
    return json_response