import pytest
import requests
import os
import subprocess

ENDPOINT_URL=os.environ["ENDPOINT_URL"]

@pytest.fixture(scope="module", autouse=True)
def test_user():
    pwd = subprocess.run(['pwd'], stdout=subprocess.PIPE).stdout.decode('utf-8').strip()
    print(f"Running tests in {pwd}!")
    print("Creating test user ...")
    user = os.system(f"{pwd}/tests/acceptance/support-scripts/create-test-user.sh")
    yield user
    print("Deleting test user")
    os.system(f"{pwd}/tests/acceptance/support-scripts/delete-test-user.sh")

create_alias_test_data = [
    ("https://docs.aws.amazon.com/solutions/latest/constructs/welcome.html", 1),
]

@pytest.mark.parametrize("test_url,ttl", create_alias_test_data)
def test_should_create_alias(test_url: str, ttl: int) -> None:
    id_token = _get_id_token()

    print(f"Creating alias for {test_url} ...")
    response = requests.post(
        headers = {
           "Content-Type": "application/json",
           "Authorization": f"Bearer {id_token}"
        },
        url = ENDPOINT_URL,
        json = {
            "url": test_url, 
            "ttl": 1
        }
    )

    assert response.status_code == 200
    response_json = response.json()

    assert response_json["url"] == test_url

    alias_url = response_json["short_url"]

    print(f"Verifying that {alias_url} redirects to {test_url} ...")
    redirect_response = requests.get(
        url=alias_url,
        allow_redirects=False
    )

    assert redirect_response.status_code == 301
    assert redirect_response.headers["location"] == test_url

    print("LGTM!")


def _get_id_token() -> str:
    with open('/tmp/id_token.txt', 'r') as file:
        return file.read().replace('\n', '')
