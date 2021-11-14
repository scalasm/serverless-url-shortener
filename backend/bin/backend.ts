#!/usr/bin/env node

// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ZoorlPipelineStack } from "../lib/cicd/pipeline-stack";
import { WebFrontendStack } from "../lib/web-frontend-stack";
import { ApplicationStack } from "../lib/application-stack";
import { AddPermissionsBoundaryToRoles } from "../lib/support/permission-boundary";

const app = new cdk.App();

// If you want to support multiple environments, this is where to intervene
const currentEnvironment = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

// new ApplicationStack(app, "dev-application-stack", {
//   // This is the environment where the CI/CD pipeline will be actually created
//   env: currentEnvironment
// });

const pipelineStack = new ZoorlPipelineStack(app, "zoorl-pipeline-stack", {
  // This is the environment where the CI/CD pipeline will be actually created
  env: currentEnvironment,
  // This is the environment where the application stack (e.g., APIs, DynamoDB tables, ...) will be deployed
  stagingEnv: currentEnvironment
});

// Respect cdk bootstrap policy insuring pipelines construct can't create more than what it needs for CI/CD pipeline creation
const permissionBoundaryArn = cdk.Fn.importValue('CICDPipelinePermissionsBoundaryArn');
cdk.Aspects.of(pipelineStack).add(new AddPermissionsBoundaryToRoles(permissionBoundaryArn));

// const stages = app.node.tryGetContext("deploymentStages")

// new WebFrontendStack(app, `${currentEnvironment.region}-zoorl-webfrontend-stack`, {
//   env: currentEnvironment,
//   zoneName: stages["staging"]["zoneName"],
//   subdomain: stages["staging"]["subdomain"]
// });

//app.synth();
