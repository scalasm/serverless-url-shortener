import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Construct, Environment, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { ZoorlApplicationStage } from "./zoorl-application-stage";
import * as custom_actions from "./custom-pipeline-actions";

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
        repo: "zoorl-serverless-url-shortener",
        branch: "main",
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

    pipeline.codePipeline.addStage( {
      stageName: "UnitTests",
      actions: [
        custom_actions.pythonUnitTestsAction(sourceArtifact)
      ]
    });

    // This is where we add the application stages
    const preprod = new ZoorlApplicationStage(this, "PreProd", {
      env: props.preprodEnv
    });
    const preprodStage = pipeline.addApplicationStage(preprod);
    preprodStage.addActions( 
      custom_actions.acceptanceTestsAction(pipeline, preprod, sourceArtifact)
    );
  }
}