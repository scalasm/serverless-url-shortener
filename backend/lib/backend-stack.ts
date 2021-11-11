// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { AuthStack } from "./auth-stack";
import { NetworkStack } from "./network-stack";
import { ZoorlAPIStack } from "./zoorl-api-stack";

/**
 * TODO Remove this: it has been replaced by the application stage in the CI/CD pipeline stack
 */
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(this, "network-stack");

    const authStack = new AuthStack(this, "auth-stack" );

    const apiStack = new ZoorlAPIStack(this, "api-stack", {
      vpc: networkStack.vpc,

      userPool: authStack.userPool,
      userPoolClient: authStack.userPoolClient
    });
  }
}
