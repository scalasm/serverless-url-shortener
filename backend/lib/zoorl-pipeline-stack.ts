import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from "@aws-cdk/aws-iam";
import { Construct, Environment, SecretValue, Stack, StackProps, StageProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction, ShellScriptAction, AddStageOptions } from "@aws-cdk/pipelines";
import { ZoorlApplicationStage } from "./zoorl-application-stage";

/**
 * Configuration properties for the pipeline stack.
 */
export interface ZoorlPipelineStackProps extends StackProps {
  preprodEnv: Environment;
}

/**
 * Pipeline stack.
 */
export class ZoorlPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: ZoorlPipelineStackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "CICDPipeline", {
      // DO NOT COMMIT: it's only for local testing!
      selfMutating: true,

      // The pipeline name
      pipelineName: "ZoorlPipeline",
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager("github-token"),
        owner: "scalasm",
        repo: "serverless-url-shortener",
        branch: "features/zoorl-2",
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
      }),
    });

    // This is where we add the application stages
    const preprod = new ZoorlApplicationStage(this, "PreProd", {
      env: props.preprodEnv
    });
    const preprodStage = pipeline.addApplicationStage(preprod);
    preprodStage.addActions(new ShellScriptAction({
      actionName: "RunAcceptanceTests",
      // Acceptance tests code is in the ... source code, so we need the pipeline to unzip it for us in the working folder :)
      additionalArtifacts: [
        sourceArtifact
      ],
      useOutputs: {
        // Get the stack Output from the Stage and make it available in
        // the shell script as $ENDPOINT_URL.
        ENDPOINT_URL: pipeline.stackOutput(preprod.apiUrlOutput),
        TARGET_AWS_REGION: pipeline.stackOutput(preprod.regionOutput),
        USER_POOL_ID: pipeline.stackOutput(preprod.userPoolIdOutput),
        USER_POOL_CLIENT_ID: pipeline.stackOutput(preprod.userPoolClientIdOutput),
      },
      commands: [
        "python --version",
        "pipenv --version",
        "cd backend/lambda",
        "pipenv install",
        "pipenv install --dev",
        "pipenv run pytest tests/acceptance/"
      ],
      rolePolicyStatements: [
        // Allow for creating / destroying / authenticating test users 
        new iam.PolicyStatement({
          resources: ["*"],
          actions: [
            "cognito-idp:AdminCreateUser",
            "cognito-idp:AdminDeleteUser",
            "cognito-idp:AdminSetUserPassword",
            "cognito-idp:AdminInitiateAuth"
          ],
        })
      ]
    }));
  }
}