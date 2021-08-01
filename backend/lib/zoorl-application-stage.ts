// Copyright Mario Scalas 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { CfnOutput, Construct, Stage, StageProps } from "@aws-cdk/core";
import { SharedStack } from "./shared-stack";
import { ZoorlAPIStack } from "./zoorl-api-stack";

/**
 * Deployable unit collecting all required stacks for our application (e.g., frontend and backend in dev/prod environments).
 */
export class ZoorlApplicationStage extends Stage {
  public readonly apiUrlOutput: CfnOutput;
  
  public readonly userPoolIdOutput: CfnOutput;
  public readonly userPoolArnOutput: CfnOutput;
  public readonly userPoolClientIdOutput: CfnOutput;
  public readonly identityPoolIdOutput: CfnOutput;
  public readonly regionOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const sharedStack = new SharedStack(this, "zoorl-shared-stack")

    const apiStack = new ZoorlAPIStack(this, "zoorl-api-stack", {
        userPool: sharedStack.userPool,
        userPoolClient: sharedStack.userPoolClient
    });
    
    // Expose application details for this stage: API URL and auth
    this.apiUrlOutput = apiStack.apiUrlOutput;

    this.identityPoolIdOutput = sharedStack.identityPoolIdOutput;
    this.userPoolClientIdOutput = sharedStack.userPoolClientIdOutput;
    this.userPoolIdOutput = sharedStack.userPoolIdOutput;
    this.userPoolArnOutput = sharedStack.userPoolArnOutput;

    this.regionOutput = sharedStack.regionOutput;
  }
}