// Copyright Mario Scalas 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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

const REQUIRED_HTTP_CORS_HEADERS = [
  "Content-Type",
  "X-Amz-Date",
  "X-Amz-Security-Token",
  "Authorization",
  "X-Api-Key",
  "X-Requested-With",
  "Accept",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Headers"
];

/**
 * URL Shortener API stack.
 */
export class ZoorlAPIStack extends cdk.Stack {
  /**
   * The URL of the API Gateway endpoint, for use in the integ tests
   */
   public readonly apiUrlOutput: cdk.CfnOutput;

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
      index: "zoorl/lambda_port.py", // optional, defaults to "index.py"
      handler: "handler", // optional, defaults to "handler"
      runtime: lambda.Runtime.PYTHON_3_8, // optional, defaults to lambda.Runtime.PYTHON_3_7
      memorySize: 256,
      environment: {
        "URLS_TABLE": urlsTable.tableName
      }
    });

    // enable the Lambda function to access the DynamoDB table (using IAM)
    urlsTable.grantFullAccess(urlShortenerFunction);

    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, "UrlShortenerFunctionAuthorizer", {
      cognitoUserPools: [ props.userPool ]
    } );

    const apiIntegration = new apigateway.LambdaIntegration(urlShortenerFunction);

    const urlShortenerApi = new apigateway.RestApi(this, "zoorl-api", {
      defaultCorsPreflightOptions: {
        allowCredentials: true,
        allowHeaders: REQUIRED_HTTP_CORS_HEADERS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });
    
    // Map POST /u
    const urlResource = urlShortenerApi.root //.root.addResource("u");
    urlResource.addMethod("POST", apiIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Map GET /u/{alias}
    const getUrlResource = urlResource.addResource("{alias}");
    getUrlResource.addMethod("GET", apiIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE
    });

    this.apiUrlOutput = new cdk.CfnOutput(this, 'Url', {
      value: urlShortenerApi.url
    });
  }
}
