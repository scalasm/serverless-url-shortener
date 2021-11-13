// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Construct, Environment, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { ApplicationStage } from "./application-stage";
import * as customactions from "./custom-pipeline-actions";
import * as iam from "@aws-cdk/aws-iam";
import { config, SharedIniFileCredentials, Organizations } from "aws-sdk";
import { OrganizationsHelper, StageDetails } from "../support/organizations-helper";

/**
 * Configuration properties for the pipeline stack.
 */
export interface ZoorlPipelineStackProps extends StackProps {
  stagingEnv: Environment;
}

/**
 * Pipeline stack.
 */
export class ZoorlPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: ZoorlPipelineStackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact("source");
    const cloudAssemblyArtifact = new codepipeline.Artifact("cloudAssembly");

    const lambdaArtifact = new codepipeline.Artifact("lambda");

    const githubSettings = this.node.tryGetContext("github");

    const pipeline = new CdkPipeline(this, "CICDPipeline", {
      // DO NOT COMMIT: it's only for local testing!
      selfMutating: true,

      // The pipeline name
      pipelineName: `${this.region}-zoorl-pipeline`,
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager("github-token"),
        owner: githubSettings["alias"],
        repo: githubSettings["repo_name"],
        branch: githubSettings["repo_branch"],
      }),

      // How it will be built and synthesized
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        // Required when building Lambdas which uses Docker (our case)
        // See https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#cannot-connect-to-the-docker-daemon-at-unixvarrundockersock
        environment: {
          privileged: true,
        },
        subdirectory: "backend",
        // For Typescript-based Lambdas We need a build step for traspiling
        buildCommand: "npm run build",
        rolePolicyStatements: [
          new iam.PolicyStatement({
              actions: [
                  "organizations:ListAccounts",
                  "organizations:ListTagsForResource"
              ],
              resources: ["*"],
          }),
      ],
        additionalArtifacts: [
          {
            directory: "lambda",
            artifact: lambdaArtifact
          }
        ]
      }),
    });

    new cdk.CfnOutput(this, "PipelineConsoleUrl", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.codePipeline.pipelineName}/view?region=${Stack.of(this).region}`,
    });

    new OrganizationsHelper()
      .forEachStage((stageDetails) => {
        const applicationStage = new ApplicationStage(this, stageDetails.name, {env: {account: stageDetails.accountId}});
        const stage = pipeline.addApplicationStage(applicationStage);
        stage.addActions(
          customactions.pythonUnitTestsAction(lambdaArtifact),
          customactions.acceptanceTestsAction(pipeline, applicationStage, lambdaArtifact)
        );
      });
  }
}