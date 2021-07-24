from botocore.exceptions import ClientError

from zoorl.common import (
    ShortenedUrlRepository, 
    ShortenedUrlModel, 
    ShortenedUrlRepositoryException
)

class DynamoDBShortUrlRepository(ShortenedUrlRepository):
    """DynamoDB repository implementation"""
    def __init__(self, table):
        self.table = table
    
    def save(self, shortened_url: ShortenedUrlModel) -> None:
        # put item in table
        response = self.table.put_item(
            Item={
                "url_hash": shortened_url.alias,
                "long_url": shortened_url.long_url,
                "ttl": shortened_url.ttl
            }
        )
        print("PutItem succeeded: " + str(response))

    def get_by_alias(self, alias: str) -> str:
        try:
            response = self.table.get_item(
                Key = { "url_hash": alias }
            )
            print("GetItem succeeded: " + str(response))
        except ClientError as e:
            raise ShortenedUrlRepositoryException(e.response['Error']['Message'])
        else:
            # If we found anything, let's return the URL or None
            item = response.get("Item", None)
            if item:
                return item.get("long_url", None)
            else:
                return None
