declare var $AWS_CONFIG: AwsConfig;

interface AwsConfig {
    Auth: {
        identityPoolId: string,
        region: string,
        identityPoolRegion: string,
        userPoolId: string,
        userPoolWebClientId: string
    }
}