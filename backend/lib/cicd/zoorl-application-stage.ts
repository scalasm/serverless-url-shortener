// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import { AuthStack } from "../auth-stack";
import { NetworkStack } from "../network-stack";
import { ZoorlAPIStack } from "../zoorl-api-stack";

/**
 * Deployable unit collecting all required stacks for our application (e.g., frontend and backend in dev/prod environments).
 */
export class ZoorlApplicationStage extends cdk.Stage {
  public readonly apiUrlOutput: cdk.CfnOutput;

  public readonly userPoolIdOutput: cdk.CfnOutput;
  public readonly userPoolClientIdOutput: cdk.CfnOutput;
  public readonly identityPoolIdOutput: cdk.CfnOutput;
  public readonly regionOutput: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(this, "network-stack");

    const authStack = new AuthStack(this, "auth-stack")

    const apiStack = new ZoorlAPIStack(this, "api-stack", {
      vpc: networkStack.vpc,

      userPool: authStack.userPool,
      userPoolClient: authStack.userPoolClient
    });

    // Expose application details for this stage: API URL and auth
    this.apiUrlOutput = apiStack.apiUrlOutput;

    this.identityPoolIdOutput = authStack.identityPoolIdOutput;
    this.userPoolClientIdOutput = authStack.userPoolClientIdOutput;
    this.userPoolIdOutput = authStack.userPoolIdOutput;
    this.regionOutput = authStack.regionOutput;
  }
}