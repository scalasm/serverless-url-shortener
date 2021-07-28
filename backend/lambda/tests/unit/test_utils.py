import pytest
from pytest_mock import MockerFixture

from datetime import datetime

import zoorl.utils as utils

compute_hash_test_data = [
    ("http://www.google.com", "cKe4cZG"),
]

@pytest.mark.parametrize("url,expected_hash", compute_hash_test_data)
def test_compute_hash(url, expected_hash) -> None:
    hash = utils.compute_hash(url)

    print(f"{url} ==> {hash}")
    assert hash == expected_hash


compute_epoch_time_from_ttl_test_data = [
    (datetime(2021, 7, 24, 17, 30), 1, datetime(2021, 7, 25, 17, 30)),
    (datetime(2021, 7, 1, 17, 30), 7, datetime(2021, 7, 8, 17, 30)),
    (datetime(2021, 7, 1, 17, 30), 30, datetime(2021, 7, 31, 17, 30)),
]

@pytest.mark.parametrize("now_datetime,ttl_threshold,expected_datetime", compute_epoch_time_from_ttl_test_data)
def test_compute_epoch_time_from_ttl(mocker: MockerFixture, now_datetime: datetime, ttl_threshold: int, expected_datetime: datetime) -> None:
    mocker.patch.object(utils, "get_now", return_value=now_datetime)

    computed_ttl = utils.compute_epoch_time_from_ttl(ttl_threshold)
    assert computed_ttl == expected_datetime.timestamp()
