import pytest

from zoorl.common import TimeToLiveThreshold

class TestTimeToLiveThreshold:
    compute_ttl_test_data = [
        (TimeToLiveThreshold.ONE_DAY, 1),
        (TimeToLiveThreshold.SEVEN_DAYS, 7),
        (TimeToLiveThreshold.THIRTY_DAYS, 30),
        ("anything", 1)
    ]

    @pytest.mark.parametrize("ttl_threshold, expected_days", compute_ttl_test_data)
    def test_compute_ttl(self, ttl_threshold: TimeToLiveThreshold, expected_days: int) -> None:
        assert TimeToLiveThreshold.to_days(ttl_threshold) == expected_days
