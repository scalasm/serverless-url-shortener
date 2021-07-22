# How to develop within Visual Studio Code

Use Pipenv to setup your VSC workspace

```
mario@Sharkey:~/src/serverless/serverless-url-shortner/backend/lambda$ pipenv install
```

Then open VSC in the `lambda` directory and then you typically have a shell with Pipenv:

```
mario@Sharkey:~/src/serverless/serverless-url-shortner/backend/lambda$ pipenv shell
```

In addition you may want to set the Python interpreter in VSC (using `CTRL+P`) and selecting the Pipenv's venv.

Just for reference, my `.vscode/settings.json` file is:

```json
{
    "python.pythonPath": "/home/mario/.local/share/virtualenvs/lambda-nx6Apu_T/bin/python",
    "python.testing.pytestArgs": [
        "tests"
    ],
    "python.testing.unittestEnabled": false,
    "python.testing.nosetestsEnabled": false,
    "python.testing.pytestEnabled": true,
    "python.envFile": "${workspaceFolder}/.env"
}
```
