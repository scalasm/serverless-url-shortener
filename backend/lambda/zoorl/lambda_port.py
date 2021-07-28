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

def handler(event, context):
    print(json.dumps(event))

    repository = DynamoDBShortUrlRepository(service_config.urls_table)
    service = UrlShortenerService(repository, service_config)

    try:
        if "GET" == event["httpMethod"]:
            return handle_redirect(event, context, service)
        elif "POST" == event["httpMethod"]:
            return handle_create_alias(event, context, service)
    except ApplicationException as e:
        return lambda_utils.to_json_response({
                "message": str(e)
        }, http_status_code=400)

def handle_redirect(event, context, service: UrlShortenerService) -> dict:
    alias = lambda_utils.get_path_parameter(event, "alias")
    long_url = service.get_long_url_by_alias(alias)

    print(f"Redirecting to mapped URL: {alias} --> {long_url}")

    return {
        "statusCode": 301,
        "headers": {
            "Location": long_url
        }
    }    

def handle_create_alias(event, context, service: UrlShortenerService) -> dict:
    json_body = lambda_utils.get_json_body(event)
    url = json_body.get("url", None)
    ttl = json_body.get("ttl", None)
    if ttl:
        ttl = int(ttl)

    try:
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
    except AliasIsUnknownException as e:
        return lambda_utils.to_json_response({
            "message": str(e),
        }, http_status_code=404)
