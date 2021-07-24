import hashlib

from datetime import datetime, timedelta

from zoorl.common import TimeToLiveThreshold

def compute_ttl(ttl_threshold: TimeToLiveThreshold) -> int:
    """Compute the UNIX epoch time from now according to the specified threshold"""
    now = datetime.now()
    days_from_now = {
        TimeToLiveThreshold.ONE_DAY: 1,
        TimeToLiveThreshold.ONE_WEEK: 7,
        TimeToLiveThreshold.ONE_MONTH: 30
    }.get(ttl_threshold)

    time_delta = timedelta(days=days_from_now)
    ttl_date = now + time_delta
    return int(ttl_date.timestamp())

def compute_hash(url: str) -> str:
    """Compute the hash of a given URL as Base62-encoded string"""
    hash = int(hashlib.sha256(url.encode('utf-8')).hexdigest(), 16) % 10**12

    return to_base_62(hash)

def to_base_62(some_number: int) -> str:
    """Encode a number into its Base62 representation"""
    s = '012345689abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    hash_str = ''
    while some_number > 0:
       hash_str = s[some_number % 62] + hash_str
       some_number //= 62
    return hash_str