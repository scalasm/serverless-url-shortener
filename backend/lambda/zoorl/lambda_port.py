import json

from zoorl.common import (
    ApplicationException,
    TimeToLiveThreshold,
    UrlShortenerServiceConfig
) 
from zoorl.dynamodb_adapter import DynamoDBShortUrlRepository
from zoorl.usecases import UrlShortenerService
import zoorl.lambda_utils as lambda_utils

# Get the service resource.
dynamodb = lambda_utils.get_dynamodb_client()

# set environment variable
TABLE_NAME = lambda_utils.get_env("URLS_TABLE")
HOST_DOMAIN_PREFIX = lambda_utils.get_env("HOST_DOMAIN_PREFIX")

def handler(event, context):
    print(json.dumps(event))

    table = dynamodb.Table(TABLE_NAME)

    repository = DynamoDBShortUrlRepository(table)
    config = UrlShortenerServiceConfig(HOST_DOMAIN_PREFIX)
    service = UrlShortenerService(repository, config)

    try:
        if "GET" == event["httpMethod"]:
            return handle_redirect(event, context, service)
        elif "POST" == event["httpMethod"]:
            return handle_create_alias(event, context, service)
    except ApplicationException as e:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "message": str(e)
            })
        }   

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

    url = json_body["url"]

    alias = service.shorten_url(url, TimeToLiveThreshold.ONE_DAY)
    short_url = f"{HOST_DOMAIN_PREFIX}/{alias}"

    print(f"Aliasing URL: {short_url} --> {url}")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "url": url,
            "short_url": short_url
        })
    }
