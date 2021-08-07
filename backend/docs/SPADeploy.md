# Deploying an Single Page WebApp using AWS CDK

In Zoorl, I have used [CDK-SPA-Deploy](https://github.com/nideveloper/CDK-SPA-Deploy) in order to simplify deployment of the webapp.

The manual dependencies that I had to add are the following:
```
npm i @aws-cdk/aws-certificatemanager @aws-cdk/aws-cloudfront @aws-cdk/aws-iam @aws-cdk/aws-route53 @aws-cdk/aws-route53-patterns @aws-cdk/aws-route53-targets @aws-cdk/aws-s3-deployment @aws-cdk/aws-s3
```
