# Backend documentation

The implementation follows the [AWS Activate Workshop](https://activate.workshop.aws/) suggestions for configuring an AWS organization using multiple accounts for different roles:
 * `Root account` - this is where the administrator user is and where billing is consolidated
 * `CI/CD account` - this is where the CI/CD pipelines are deployed: in this case, the pipeline will be triggered on changes in the GitHub repository and propagate changes in the pipeline.
 * `development`, `staging` and `production` accounts 

(Yep, it is quite a setup but it works as a one-shot blueprint that will then help setting up any new product/service according to actual best practices).

# Prerequisites

1. You have setup your AWS organization according to instructions used in the [AWS Activate Workshop](https://activate.workshop.aws/) site.

2. You have created a [GitHub Connection](https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create-github.html) and configured its ARN as a secret value in AWS Secrets Manager:
```
aws --profile cicd secretsmanager create-secret --name GITHUB_CONNECTION_ARN --secret-string <YOUR-JUST-CREATED-CONNECTION-ARN>

```
  * Here I decided to use the new [CodeStar action](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html) for fetching sources from GitHub and I did not want to expose its ARN - so I stored it into the AWS Secrets Manager.
  * Note that in order to access this secret, you will also need to increase the default permission boundary as set in the [AWS Activate Workshop](https://activate.workshop.aws/) setup. See [this commit](https://github.com/scalasm/aws-bootstrap-kit-examples/commit/a65f116d0c629c256cf72ff19e0308abfdd98ff3) for reference.
  * Feel free to use revert to the GitHub action, if you are not comfortable with this change.

# How to build

Deploy the pipeline stack using:
```
npm run cdk:deploy -- --profile cicd
```

THe pipeline will then roll the application in the different deployment stages (`dev`, `staging` and `production`).

# Using the API with CURL

TODO

