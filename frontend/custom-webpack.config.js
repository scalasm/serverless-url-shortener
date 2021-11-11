const webpack = require("webpack");

/**
 * This plugin exposes some OS environment variables to be used as part of our build.
 */
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      $AWS_CONFIG: {
        //    'aws_appsync_graphqlEndpoint': `${process.env.ANGULAR_APP_APPSYNC_API}`,
        //    'aws_appsync_region': `${process.env.ANGULAR_APP_REGION}`,
        //    'aws_appsync_authenticationType': 'AMAZON_COGNITO_USER_POOLS',
        Auth: {
          identityPoolId: `"${process.env.ANGULAR_APP_IDENTITY_POOL_ID}"`,
          region: `"${process.env.ANGULAR_APP_REGION}"`,
          identityPoolRegion: `"${process.env.ANGULAR_APP_REGION}"`,
          userPoolId: `"${process.env.ANGULAR_APP_USER_POOL_ID}"`,
          userPoolWebClientId: `"${process.env.ANGULAR_APP_USER_POOL_CLIENT_ID}"`,
        },
        apiEndpoint: `"${process.env.ANGULAR_APP_API_ENDPOINT}"`,
      },
    }),
  ],
};
