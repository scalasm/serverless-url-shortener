import json

from zoorl.common import (
    ApplicationException,
    ApplicationConfig
) 
from zoorl.dynamodb_adapter import DynamoDBShortUrlRepository
from zoorl.usecases import (
    UrlShortenerService,
    AliasIsUnknownException
)
import zoorl.lambda_utils as lambda_utils

# Get the service resource.
service_config = ApplicationConfig()

def handler(event, context) -> dict:
    print(json.dumps(event))

    repository = DynamoDBShortUrlRepository(service_config.urls_table)
    service = UrlShortenerService(repository, service_config)

    response = None

    try:
        handler = {
            "GET": lambda event, context, service: handle_redirect(event, context, service),
            "POST": lambda event, context, service: handle_create_alias(event, context, service)
        }.get(event["httpMethod"], lambda event, context, service: handle_unsupported_http_method(event, context, service))

        response = handler(event, context, service)
    except ApplicationException as e:
        print(f"Exception {type(e)} occurred!")
        response = lambda_utils.to_json_response({
                "message": str(e)
        }, http_status_code=400)
    
    print(response)
    return response


def handle_redirect(event, context, service: UrlShortenerService) -> dict:
    alias = lambda_utils.get_path_parameter(event, "alias")

    try:
        long_url = service.get_long_url_by_alias(alias)

        print(f"Redirecting to mapped URL: {alias} --> {long_url}")

        return {
            "statusCode": 301,
            "headers": {
                "Location": long_url
            }
        }
    except AliasIsUnknownException as e:
        return lambda_utils.to_json_response({
            "message": str(e),
        }, http_status_code=404)


def handle_create_alias(event, context, service: UrlShortenerService) -> dict:
    """Properly manages requests for creating an alias"""
    json_body = lambda_utils.get_json_body(event)
    url = json_body.get("url", None)
    ttl = json_body.get("ttl", None)
    if ttl:
        ttl = int(ttl)

    alias = service.shorten_url(url, ttl)

    protocol = event["headers"]["X-Forwarded-Proto"]
    domainName = event["requestContext"]["domainName"]
    path = event["requestContext"]["path"] # /prod
    short_url = f"{protocol}://{domainName}{path}{alias}"

    print(f"Aliasing URL: {short_url} --> {url}")

    return lambda_utils.to_json_response({
        "url": url,
        "short_url": short_url
    }, http_status_code=200)

def handle_unsupported_http_method(event, context, service: UrlShortenerService) -> dict:
    """
    This is a safeguard method against improper usage of the API. The main reason for this function
    is to discover mismatches between the infrastructure stack (where the HTTP mapping is defined) 
    and the actual implementation here.
    """
    unsupported_method = event["httpMethod"]
    request_path = event["requestContext"]["path"]
    
    error_message = f"Unsupported HTTP request: {unsupported_method} for {request_path}"
    
    print(error_message)

    return lambda_utils.to_json_response({
        "message": error_message,
    }, http_status_code=400)

