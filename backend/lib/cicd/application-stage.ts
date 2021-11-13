// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import { ApplicationStack } from "../application-stack";

/**
 * Deployable unit collecting all required stacks for our application (e.g., frontend and backend in dev/prod environments).
 */
export class ApplicationStage extends cdk.Stage {
  public readonly apiUrlOutput: cdk.CfnOutput;

  public readonly userPoolIdOutput: cdk.CfnOutput;
  public readonly userPoolClientIdOutput: cdk.CfnOutput;
  public readonly identityPoolIdOutput: cdk.CfnOutput;
  public readonly regionOutput: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const applicationStack = new ApplicationStack(this, "application-stack");

    // Expose application details for this stage: API URL and auth
    this.apiUrlOutput = applicationStack.apiStack.apiUrlOutput;

    this.identityPoolIdOutput = applicationStack.authStack.identityPoolIdOutput;
    this.userPoolClientIdOutput = applicationStack.authStack.userPoolClientIdOutput;
    this.userPoolIdOutput = applicationStack.authStack.userPoolIdOutput;
    this.regionOutput = applicationStack.authStack.regionOutput;
  }
}
