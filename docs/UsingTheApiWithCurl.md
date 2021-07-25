# Using the API from CLI with CURL

Just a commands scratchpad so that I can copy and paste with easy

## Redirect

```
mario@Sharkey:~/src/serverless/serverless-url-shortener/backend$ curl https://0l7iqkXYZW.execute-api.eu-west-2.amazonaws.com/prod/efBcX69 --verbose
...

* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 301 
< content-type: application/json
< content-length: 0
< location: https://www.youtube.com/watch?v=trJgibvLGQc&ab_channel=SrceCde
< date: Sat, 24 Jul 2021 20:05:13 GMT
< x-amzn-requestid: c5574728-fc43-44a2-bddc-3bf55017681e
< x-amz-apigw-id: C_bS-GRcDoEF9fg=
...
```

## Create shortened URL

```
TODO :)
```
