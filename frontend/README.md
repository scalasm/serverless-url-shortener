# Zoorl Web Frontend

This is the web frontend for Zoorl: the project itself project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.4.

Additional components are:
* [Material UI for Angular](https://material.angular.io/)
* [AWS Amplify SDK for Angular](https://docs.amplify.aws/start/q/integration/angular?sc_icampaign=angular-start&sc_ichannel=choose-integration)

Note that in this project we make, at this moment, a very limited use of Amplify's features and only actually use it as a "quick setup" tool.

# Architecture

The application is nothing fance: basic Angular features that support two use cases:
* login / logout (courtesy for AWS Amplify UI for Angular)
* creation of a new URL alias (a simple form).

## Development

Take a look at the `package.json` for all possible run targets.

# Local development

Locally you use the usual tools but actually you are going to run `npm run start`, which we'll build the application and watch for changes.

Note that you have to create the file in `$PROJECT_ROOT/.env.local` and put your environment variables' values according to your infrastructure. In example: 
```
ANGULAR_APP_REGION=eu-west-1
ANGULAR_APP_IDENTITY_POOL_ID=eu-west-1:315847e8-c35e-YYYY-XXXX-a324ec91584d
ANGULAR_APP_USER_POOL_CLIENT_ID=4kea634gfmfu1a6b8kmb7oXYZW
ANGULAR_APP_USER_POOL_ID=eu-west-1_LYxzlXYZW
ANGULAR_APP_APPSYNC_API=https://m5pipiuluzbh7gkc422jb6yuam.appsync-api.eu-west-1.amazonaws.com/graphql
```
Having done this, you can run one of the several `*:local` npm targets, like `npm run build:local`.

The file is not versioned because it contains sensible data and we don't want to share those over the Internet, right? :)

# Debugging from VS Code 

Install the [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) (deprecated, I know) and create a `.vscode/launch.json` with the following:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:4200",
            "webRoot": "${workspaceFolder}"
        },
        {
            "type": "chrome",
            "request": "attach",
            "name": "Attach to Chrome",
            "port": 9222,
            "webRoot": "${workspaceFolder}"
        }
    ]
}
```

After that you will have the `Launch Chrome against localhost` target in the run configurations: a new clean Chrome (no shared configurations, cookies, ...) will be launched and you can set up your breakpoints in VSC without problems.

Note that you still have to run your application using `npm run start`: with VSC debugging you only fire a debug-enabled chrome instance pointing at your environment!