// Copyright Mario Scalas 2021. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

/**
 * Network stack for hosting the application.
 */
export class NetworkStack extends cdk.NestedStack {

  readonly vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "vpc", {
      natGateways: 1
    })
  }
}
