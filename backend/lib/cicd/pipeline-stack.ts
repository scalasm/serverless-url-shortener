// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import { ApplicationStage } from "./application-stage";
import * as customactions from "./custom-pipeline-actions";
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as iam from "@aws-cdk/aws-iam";
import { OrganizationsHelper } from "../support/organizations-helper";
import { ShellStep } from "@aws-cdk/pipelines";

/**
 * Configuration properties for the pipeline stack.
 */
export interface ZoorlPipelineStackProps extends cdk.StackProps {
  stagingEnv: cdk.Environment;
}

/**
 * Pipeline stack.
 */
export class ZoorlPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ZoorlPipelineStackProps) {
    super(scope, id, props);

    // You must create a github connection before running this stack, see
    // https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create-github.html
    const githubSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubConnectionArnSecret', "GITHUB_CONNECTION_ARN");

    const githubSettings = this.node.tryGetContext("github");

    const source = pipelines.CodePipelineSource.connection(`${githubSettings["alias"]}/githubSettings["repo_name"]`, githubSettings["repo_branch"], {
      connectionArn: githubSecret.secretValue.toString(),
      triggerOnPush: true
    });

    const synthStep = new pipelines.ShellStep('Synth', {
      input: source,
      commands: [
        "npm ci", 
        "npm run cdk:synth"
      ]
    });

    const codePipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: `${this.region}-zoorl-pipeline`,
      synth: synthStep,
      // We deploy to multiple accounts and they need to share the encryption key for the artifacts bucket
      crossAccountKeys: true,
      // We use docker to build our Lambda functions
      dockerEnabledForSynth: true,
      synthCodeBuildDefaults: {
        rolePolicy: [
          new iam.PolicyStatement({
              actions: [
                  "organizations:ListAccounts",
                  "organizations:ListTagsForResource"
              ],
              resources: ["*"],
          })
        ]
      }
    });

    // const pipeline = new pipelines.CodePipeline(this, "CICDPipeline", {
    //   pipelineName: `${this.region}-zoorl-pipeline`,
    //   // DO NOT COMMIT: it's only for local testing!
    //   selfMutation: true,

    //   cloudAssemblyArtifact,

    //   // How it will be built and synthesized
    //   synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
    //     sourceArtifact,
    //     cloudAssemblyArtifact,
    //     // Required when building Lambdas which uses Docker (our case)
    //     // See https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#cannot-connect-to-the-docker-daemon-at-unixvarrundockersock
    //     environment: {
    //       privileged: true,
    //     },
    //     subdirectory: "backend",
    //     // For Typescript-based Lambdas We need a build step for traspiling
    //     buildCommand: "npm run build",
    //     rolePolicyStatements: [
    //       new iam.PolicyStatement({
    //           actions: [
    //               "organizations:ListAccounts",
    //               "organizations:ListTagsForResource"
    //           ],
    //           resources: ["*"],
    //       }),
    //   ],
    //     additionalArtifacts: [
    //       {
    //         directory: "lambda",
    //         artifact: lambdaArtifact
    //       }
    //     ]
    //   }),
    // });

    // new cdk.CfnOutput(this, "PipelineConsoleUrl", {
    //   value: `https://${cdk.Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${codePipeline.pipeline.pipelineName}/view?region=${cdk.Stack.of(this).region}`,
    // });

    new OrganizationsHelper()
      .forEachStage((stageDetails) => {
        const applicationStage = new ApplicationStage(this, stageDetails.name, {env: {account: stageDetails.accountId}});
        const stage = codePipeline.addStage(applicationStage, {
          pre: [
            customactions.pythonUnitTestsAction(synthStep)
          ]
        });
//        customactions.acceptanceTestsAction(pipeline, applicationStage, lambdaArtifact)
    });
  }
}