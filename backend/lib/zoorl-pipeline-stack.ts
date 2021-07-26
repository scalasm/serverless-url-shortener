import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
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
      })
    });

    // This is where we add the application stages
    const preprod = new ZoorlApplicationStage(this, "PreProd", {
      env: props.preprodEnv
    });
    const preprodStage = pipeline.addApplicationStage(preprod, {
      
    });
    preprodStage.addActions(new ShellScriptAction({
      actionName: "RunAcceptanceTests",
      useOutputs: {
        // Get the stack Output from the Stage and make it available in
        // the shell script as $ENDPOINT_URL.
        ENDPOINT_URL: pipeline.stackOutput(preprod.apiUrlOutput),
        TARGET_AWS_REGION: pipeline.stackOutput(preprod.regionOutput),
        USER_POOL_ID: pipeline.stackOutput(preprod.userPoolIdOutput),
        USER_POOL_CLIENT_ID: pipeline.stackOutput(preprod.userPoolIdOutput),
      },
      commands: [
        // Use "curl" to GET the given URL and fail if it returns an error
//        "curl -Ssf $ENDPOINT_URL",
        "pwd",
        "jq",
        "./acceptance-testing/create-test-user.sh",
        "./acceptance-testing/test-create-url-alias.sh",
        "./acceptance-testing/delete-test-user.sh"
      ],
    }));
  }
}