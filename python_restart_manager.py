import logging
import os
import sys
import threading
import time
from typing import Callable, Optional


class PythonRestartManager:
    """Reusable self-restart manager for the Python RAG process."""

    def __init__(self, logger: Optional[logging.Logger] = None, before_restart_hook: Optional[Callable[[], None]] = None):
        self._logger = logger or logging.getLogger("RAGZ")
        self._before_restart_hook = before_restart_hook
        self._lock = threading.Lock()
        self._restart_pending = False

    def is_restart_pending(self) -> bool:
        with self._lock:
            return self._restart_pending

    def schedule_restart(self, reason: str = "manual", delay_seconds: float = 0.5) -> bool:
        """Schedule a non-blocking self-restart using os.execv.

        Returns True when a new restart was scheduled, False when one is already pending.
        """
        with self._lock:
            if self._restart_pending:
                return False
            self._restart_pending = True

        worker = threading.Thread(
            target=self._restart_worker,
            args=(reason, delay_seconds),
            daemon=True,
            name="python-restart-worker",
        )
        worker.start()
        return True

    def _restart_worker(self, reason: str, delay_seconds: float) -> None:
        safe_delay = max(0.0, float(delay_seconds or 0.0))

        try:
            if self._before_restart_hook:
                self._before_restart_hook()
        except Exception as hook_error:
            self._logger.error("before_restart_hook failed: %s", hook_error)

        self._logger.warning(
            "Python self-restart scheduled in %.2fs (reason=%s)",
            safe_delay,
            reason or "unknown",
        )

        if safe_delay > 0:
            time.sleep(safe_delay)

        argv = [sys.executable] + sys.argv
        os.execv(sys.executable, argv)
