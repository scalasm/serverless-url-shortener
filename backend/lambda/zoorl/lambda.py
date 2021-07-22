from __future__ import print_function

import json
import decimal
import os
from zoorl.urlshortener import compute_hash
import boto3

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


# Get the service resource.
dynamodb = boto3.resource("dynamodb")

# set environment variable
TABLE_NAME = os.environ["URLS_TABLE"]

def handler(event, context):
    print(event)
    print(context)

    url = "https://www.google.com"

    table = dynamodb.Table(TABLE_NAME)
    # put item in table
    response = table.put_item(
        Item={
            "url_hash": compute_hash(url),
            "long_url": url
        }
    )

    print("PutItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))

    return {
        "statusCode": 200,
    }
