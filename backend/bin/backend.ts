#!/usr/bin/env node

// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ZoorlPipelineStack } from "../lib/cicd/zoorl-pipeline-stack";
import { WebFrontendStack } from "../lib/web-frontend-stack";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

// If you want to support multiple environments, this is where to intervene
const currentEnvironment = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

new BackendStack(app, "zoorl-backend-stack", {
  // This is the environment where the CI/CD pipeline will be actually created
  env: currentEnvironment
});

// new ZoorlPipelineStack(app, `${currentEnvironment.region}-zoorl-pipeline-stack`, {
//   // This is the environment where the CI/CD pipeline will be actually created
//   env: currentEnvironment,
//   // This is the environment where the application stack (e.g., APIs, DynamoDB tables, ...) will be deployed
//   stagingEnv: currentEnvironment
// });

// const stages = app.node.tryGetContext("deploymentStages")

// new WebFrontendStack(app, `${currentEnvironment.region}-zoorl-webfrontend-stack`, {
//   env: currentEnvironment,
//   zoneName: stages["staging"]["zoneName"],
//   subdomain: stages["staging"]["subdomain"]
// });

app.synth();
