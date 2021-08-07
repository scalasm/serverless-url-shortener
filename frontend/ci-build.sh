#!/usr/bin/env bash
# Builds the frontend: this script is done in order to be run throw a CI/CD environment.
set -eu

npm ci 

# TODO create .env file

npm run build
