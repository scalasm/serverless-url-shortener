#!/usr/bin/env bash
# This is is the acceptance test for creating a URL alias
set -e

# ENDPOINT_URL will be provided by the pipeline environment
#ENDPOINT_URL=$1
ID_TOKEN=$(cat /tmp/id_token.txt)

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ID_TOKEN" \
 -d @./acceptance-testing/data/test-create-url-alias.json $ENDPOINT_URL \
 --verbose
