
import json
import os
from typing import Optional, Any
import boto3

from zoorl.common import (
    ApplicationException,
    TimeToLiveThreshold,
    UrlShortenerServiceConfig
)

class LambdaLayerException(ApplicationException):
    """Exception throws in the Lambda controller layer"""
    pass

def get_path_parameter(event, param_name: str, default_value: str = "") -> Optional[str]:
    """Returns the value for the specified path parameter or the 'default_value' if not found"""
    map = event["pathParameters"]
    value = None
    if map:
        value = map[param_name]

    if not value:
        return default_value
    return value

def get_json_body(event) -> Optional[Any]:
    """Return the body as JSON object, if present; otherwise it will return None"""
    body = event["body"]
    if body:
        return json.loads(body)
    return None

def get_env(env_var: str) -> str:
    return os.environ[env_var]

# Get the service resource.

def get_dynamodb_client():
    return boto3.resource("dynamodb")