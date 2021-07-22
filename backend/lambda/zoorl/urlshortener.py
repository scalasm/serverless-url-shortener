import hashlib

def compute_hash(url: str) -> str:
    """Compute the hash of a given URL"""
    deci = int(hashlib.sha256(url.encode('utf-8')).hexdigest(), 16) % 10**12

    return to_base_62(deci)

def to_base_62(deci: int) -> str:
    """Encode a number into its Base62 representation"""
    s = '012345689abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    hash_str = ''
    while deci > 0:
       hash_str = s[deci % 62] + hash_str
       deci //= 62
    return hash_str
