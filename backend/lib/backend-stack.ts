import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { SharedStack } from "./shared-stack";
import { ZoorlAPIStack } from "./zoorl-api-stack";

/**
 * TODO Remove this: it has been replaced by the application stage in the CI/CD pipeline stack
 */
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedStack = new SharedStack(this, "shared-stack" );

    const apiStack = new ZoorlAPIStack(this, "zoorl-api-stack", {
      userPool: sharedStack.userPool,
      userPoolClient: sharedStack.userPoolClient
    });
  }
}
