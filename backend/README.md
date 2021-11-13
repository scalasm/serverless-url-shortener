# Backend documentation

The implementation follows the [AWS Activate Workshop](https://activate.workshop.aws/) suggestions for configuring an AWS organization using multiple accounts for different roles:
 * Root account - this is where the administrator user is and where billing is consolidated
 * CI/CD account - this is where the CI/CD pipelines are deployed: in this case, the pipeline will be triggered on changes in the GitHub repository and propagate changes in the pipeline.
 * development, staging and production accounts 

(Yep, it is quite a setup but it works as a one-shot blueprint that will then help setting up any new product/service according to actual best practices).

# Prerequisites

You have setup your AWS organization according to instructions used in the [AWS Activate Workshop](https://activate.workshop.aws/) site.

# How to build

If you use AWS profiles to distinguish between different accounts (like me), you may want to set `AWS_PROFILE` before running the CDK commands! On Linux/Mac/WSL2:
```
export AWS_PROFILE="development"
```

Then you can trigger the deployment:
```
npm run cdk:deploy
```

# Using the API with CURL

TODO

