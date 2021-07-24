import * as cdk from "@aws-cdk/core";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cognito from "@aws-cdk/aws-cognito";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as pylambda from "@aws-cdk/aws-lambda-python"

/**
 * Configuration properties for the URL Shortener API stack.
 */
export interface ZoorlAPIStackProps extends cdk.StackProps {

  readonly userPool: cognito.UserPool;

  readonly userPoolClient: cognito.UserPoolClient;
}

/**
 * URL Shortener API stack.
 */
export class ZoorlAPIStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ZoorlAPIStackProps) {
    super(scope, id, props);

    const urlsTable = new ddb.Table(this, "UrlsTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "url_hash",
        type: ddb.AttributeType.STRING,
      },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const urlShortenerFunction = new pylambda.PythonFunction(this, "UrlShortenerFunction", {
      entry: "lambda", // required
      index: "zoorl/lambda.py", // optional, defaults to "index.py"
      handler: "handler", // optional, defaults to "handler"
      runtime: lambda.Runtime.PYTHON_3_8, // optional, defaults to lambda.Runtime.PYTHON_3_7
      memorySize: 256,
      environment: {
        "URLS_TABLE": urlsTable.tableName,
        "HOST_DOMAIN_PREFIX": "https://zoorl.ly"
      }
    });

    // enable the Lambda function to access the DynamoDB table (using IAM)
    urlsTable.grantFullAccess(urlShortenerFunction);

    const apiIntegration = new apigateway.LambdaIntegration(urlShortenerFunction);

    const urlShortenerApi = new apigateway.RestApi(this, "zoorl-api");
    // Map POST /u
    const urlResource = urlShortenerApi.root //.root.addResource("u");
    urlResource.addMethod("POST", apiIntegration);

    // Map GET /u/{alias}
    const getUrlResource = urlResource.addResource("{alias}");
    getUrlResource.addMethod("GET", apiIntegration);
  }
}
