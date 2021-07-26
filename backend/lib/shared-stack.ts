import * as cdk from "@aws-cdk/core";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as cognito from "@aws-cdk/aws-cognito";

/**
 * Shared resources across stacks.
 */
export class SharedStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;
    public readonly identityPool: cognito.CfnIdentityPool;

    public readonly userPoolIdOutput: cdk.CfnOutput;
    public readonly userPoolArnOutput: cdk.CfnOutput;
    public readonly userPoolClientIdOutput: cdk.CfnOutput;
    public readonly identityPoolIdOutput: cdk.CfnOutput;

    public readonly regionOutput: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, " ZoorlUserPool", {
            userPoolName: "ZoorlUserPool",
            selfSignUpEnabled: true, // Allow users to sign up
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            signInAliases: { email: true } // Set email as alias
        });

        this.userPoolClient = new cognito.UserPoolClient(this, "ZoorlUserPoolClient", {
            userPool: this.userPool,
            authFlows: {
                adminUserPassword: true
            },
            generateSecret: false // No need to generate a secret for webapps running in browser
        });

        this.identityPool = new cognito.CfnIdentityPool(this, "ZoorlIdentityPool", {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        });


        this.identityPoolIdOutput = new cdk.CfnOutput(this, "IdentityPoolId", {
            value: this.identityPool.ref || ""
        });
        this.userPoolClientIdOutput = new cdk.CfnOutput(this, "UserPoolClientId", {
            value: this.userPoolClient.userPoolClientId || ""
        });
        this.userPoolIdOutput = new cdk.CfnOutput(this, "UserPoolId", {
            value: this.userPool.userPoolId || ""
        });
        this.userPoolArnOutput = new cdk.CfnOutput(this, "UserPoolArn", {
            value: this.userPool.userPoolArn || ""
        });
        this.regionOutput = new cdk.CfnOutput(this, "Region", {
            value: this.region || ""
        });
    }
}
