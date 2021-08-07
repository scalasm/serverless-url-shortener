// Copyright Mario Scalas 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as cdk from "@aws-cdk/core";
import { SPADeploy } from 'cdk-spa-deploy';

/**
 * Configuration properties for Web frontend stack.
 */
export interface WebFrontendStackProps extends cdk.StackProps {
    readonly zoneName: string;
    readonly subdomain?: string;
}

/**
 * Web frontend stack.
 */
export class WebFrontendStack extends cdk.Stack {
    public readonly cfDistributionNameOutput: cdk.CfnOutput;

    public readonly s3BucketArnOutput: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props: WebFrontendStackProps) {
        super(scope, id, props);

        const site = new SPADeploy(this, 'spaDeploy')
            .createSiteFromHostedZone( {
                zoneName: props.zoneName,
                subdomain: props.subdomain,
                indexDoc: "index.html",
                websiteFolder : "../frontend/dist/frontend/"
            });

        this.cfDistributionNameOutput = new cdk.CfnOutput(this, 'cfDistributionName', {
            value: site.distribution.distributionDomainName
        });

        this.s3BucketArnOutput = new cdk.CfnOutput(this, 's3BucketArn', {
            value: site.websiteBucket.bucketArn
        });

    }
}
