#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ZoorlPipelineStack } from '../lib/zoorl-pipeline-stack';

const app = new cdk.App();

// { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
const rootEnvironment: cdk.Environment = { account: '321723152483', region: 'eu-west-1' }
const sharedServicesEnvironment: cdk.Environment = { account: '335744559136', region: 'eu-west-1' }
const devEnvironment: cdk.Environment = { account: '164097117521', region: 'eu-west-1' }

new ZoorlPipelineStack(app, 'ZoorlBackendStack', {
  env: devEnvironment,
  preprodEnv: devEnvironment
});

app.synth();
