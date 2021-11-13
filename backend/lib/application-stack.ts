// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import { AuthStack } from "./auth-stack";
import { NetworkStack } from "./network-stack";
import { ApiStack } from "./api-stack";

/**
 * This is a logical representation of all application resources: you will typically use this when
 * deploying Zoorl into different deployment stages (e.g., development, staging, production).
 */
export class ApplicationStack extends cdk.Stack {
  
  readonly authStack: AuthStack;
  readonly apiStack: ApiStack;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(this, "network-stack");

    this.authStack = new AuthStack(this, "auth-stack" );

    this.apiStack = new ApiStack(this, "api-stack", {
      vpc: networkStack.vpc,

      userPool: this.authStack.userPool,
      userPoolClient: this.authStack.userPoolClient
    });
  }
}
