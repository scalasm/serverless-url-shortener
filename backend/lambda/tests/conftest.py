# pylint: disable=redefined-outer-name
import shutil
import subprocess
import time
from pathlib import Path

import pytest

@pytest.fixture
def just_reminder():
    return 1
