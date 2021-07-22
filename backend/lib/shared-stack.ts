import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as cognito from "@aws-cdk/aws-cognito";

/**
 * Shared resources across stacks.
 */
export class SharedStack extends cdk.Stack {

    public readonly userPool: cognito.UserPool;

    public readonly userPoolClient: cognito.UserPoolClient;

    public readonly identityPool: cognito.CfnIdentityPool;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, " CognitoUserPool", {
            userPoolName: "ZoorlUserPool",
            selfSignUpEnabled: true, // Allow users to sign up
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            signInAliases: { email: true } // Set email as alias
        });

        this.userPoolClient = new cognito.UserPoolClient(this, "CognitoUserPoolClient", {
            userPool: this.userPool,
            generateSecret: false // No need to generate a secret for webapps running in browser
        });

        this.identityPool = new cognito.CfnIdentityPool(this, "CognitoIdentityPool", {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        });

        new cdk.CfnOutput(this, "IdentityPoolId", {
            value: this.identityPool.ref || ''
        });
        new cdk.CfnOutput(this, "UserPoolClientId", {
            value: this.userPoolClient.userPoolClientId || ''
        });
        new cdk.CfnOutput(this, "UserPoolId", {
            value: this.userPool.userPoolId || ''
        });
    }
}
