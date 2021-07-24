import pytest
from pytest_mock import MockerFixture

from datetime import datetime

from zoorl.common import TimeToLiveThreshold
import zoorl.utils as utils

compute_hash_test_data = [
    ("http://www.google.com", "cKe4cZG"),
]

@pytest.mark.parametrize("url,expected_hash", compute_hash_test_data)
def test_compute_hash(url, expected_hash) -> None:
    hash = utils.compute_hash(url)

    print(f"{url} ==> {hash}")
    assert hash == expected_hash


compute_ttl_test_data = [
    (datetime(2021, 7, 24, 17, 30), TimeToLiveThreshold.ONE_DAY, datetime(2021, 7, 25, 17, 30)),
    (datetime(2021, 7, 1, 17, 30), TimeToLiveThreshold.SEVEN_DAYS, datetime(2021, 7, 8, 17, 30)),
    (datetime(2021, 7, 1, 17, 30), TimeToLiveThreshold.THIRTY_DAYS, datetime(2021, 7, 31, 17, 30)),
]

@pytest.mark.parametrize("now_datetime,ttl_threshold,expected_datetime", compute_ttl_test_data)
def test_compute_ttl(mocker: MockerFixture, now_datetime: datetime, ttl_threshold: TimeToLiveThreshold, expected_datetime: datetime) -> None:
    mocker.patch.object(utils, "get_now", return_value=now_datetime)

    computed_ttl = utils.compute_ttl(ttl_threshold)
    assert computed_ttl == expected_datetime.timestamp()
