import pytest

from zoorl.urlshortener import compute_hash

compute_hash_test_data = [
    ("http://www.google.com", "cKe4cZG"),
]

@pytest.mark.parametrize("url,expected_hash", compute_hash_test_data)
def test_compute_hash(url, expected_hash) -> None:
    hash = compute_hash(url)

    print(f"{url} ==> {hash}")
    assert hash == expected_hash
