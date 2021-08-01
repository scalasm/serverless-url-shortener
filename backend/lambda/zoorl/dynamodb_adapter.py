from botocore.exceptions import ClientError

from typing import Optional

from zoorl.common import (
    ShortenedUrlRepository, 
    ShortenedUrlModel, 
    RepositoryException
)

class DynamoDBShortUrlRepository(ShortenedUrlRepository):
    """DynamoDB repository implementation"""
    def __init__(self, table):
        self.table = table
    
    def save(self, shortened_url: ShortenedUrlModel) -> None:
        """Save the model to database using AWS DynamoDB table
        
        Args:
            shortened_url: the model to save
        """
        response = self.table.put_item(
            Item={
                "url_hash": shortened_url.alias,
                "long_url": shortened_url.long_url,
                "ttl": shortened_url.ttl
            }
        )
        print("PutItem succeeded: " + str(response))

    def get_by_alias(self, alias: str) -> Optional[str]:
        """Returns the long url associated, if present in the AWS DynamoDB table
                
        Args:
            alias: the model to save
        
        Returns:
            the long URL associated to that alias or None if not present

        Raises:
            RepositoryException if something bad happens when communicating with AWS DynamoDB
        """        
        try:
            response = self.table.get_item(
                Key = { "url_hash": alias }
            )
            print("GetItem succeeded: " + str(response))
        except ClientError as e:
            raise RepositoryException(e.response['Error']['Message'])
        else:
            item = response.get("Item", None)
            if item:
                return item.get("long_url", None)
            else:
                return None
