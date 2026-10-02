"""
challenges/utils.py
───────────────────
GitHub repository validation utility for the AWS SBG RIT challenge submission system.

validate_github_repo(repo_url, event_start, event_end)
  • Parses owner/repo from a GitHub URL
  • Hits the GitHub REST API (no auth token — public repos only)
  • Enforces two time-window rules:
      1. Repo must have been CREATED on or after the event start
         → prevents submitting old, pre-existing projects
      2. Repo's last push must be on or before the event deadline
         → prevents post-deadline commits sneaking in
  • Raises ValueError with a human-readable message on any failure
  • Returns the parsed API JSON dict on success (caller may inspect it)
"""

import re
import requests
from datetime import datetime, timezone as dt_timezone


# ── Internal helpers ──────────────────────────────────────────────────────────

_GH_URL_RE = re.compile(
    r'^https?://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/?\s#]+)',
    re.IGNORECASE,
)

_GH_API_BASE = 'https://api.github.com'

_REQUEST_HEADERS = {
    'Accept':     'application/vnd.github+json',
    'User-Agent': 'AWSSBG-RIT-Validator/1.0',
}


def _parse_owner_repo(url: str) -> tuple[str, str]:
    """Extract (owner, repo) from a GitHub URL, stripping .git suffix."""
    m = _GH_URL_RE.match(url.strip())
    if not m:
        raise ValueError(
            "Invalid GitHub URL. "
            "Expected format: https://github.com/username/repository-name"
        )
    owner = m.group('owner')
    repo  = m.group('repo').removesuffix('.git')
    return owner, repo


def _to_aware(dt_value) -> datetime:
    """Ensure a datetime is timezone-aware (UTC).

    Accepts:
      • datetime objects (naive → attach UTC; aware → return as-is)
      • ISO-8601 strings like '2026-09-01T10:00:00Z'
    """
    if isinstance(dt_value, str):
        # Python 3.11+ fromisoformat handles 'Z'; older versions need a replace
        dt_value = dt_value.replace('Z', '+00:00')
        dt_value = datetime.fromisoformat(dt_value)

    if dt_value.tzinfo is None:
        # Treat naive datetimes as UTC (consistent with Django's timezone.now())
        return dt_value.replace(tzinfo=dt_timezone.utc)
    return dt_value


# ── Public API ────────────────────────────────────────────────────────────────

def validate_github_repo(repo_url: str, event_start, event_end) -> dict:
    """
    Validate a GitHub repository URL against the event time window.

    Parameters
    ----------
    repo_url    : str      — e.g. 'https://github.com/alice/my-project'
    event_start : datetime — when the challenge/hackathon kicked off
    event_end   : datetime — submission deadline

    Returns
    -------
    dict — the raw GitHub API response for the repository

    Raises
    ------
    ValueError  — with a student-facing message on any validation failure
    RuntimeError — if the GitHub API is unreachable (caller should treat as 500)
    """
    owner, repo = _parse_owner_repo(repo_url)

    # ── Hit the GitHub REST API ───────────────────────────────────────────────
    api_url = f'{_GH_API_BASE}/repos/{owner}/{repo}'
    try:
        resp = requests.get(api_url, headers=_REQUEST_HEADERS, timeout=10)
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Could not reach GitHub API. Please try again later. ({exc})"
        ) from exc

    if resp.status_code == 404:
        raise ValueError(
            "Repository not found or is private. "
            "Make sure the repository exists and is set to Public."
        )

    if resp.status_code != 200:
        raise RuntimeError(
            f"GitHub API returned an unexpected status ({resp.status_code}). "
            "Please try again later."
        )

    data = resp.json()

    # ── Extract & normalise timestamps ────────────────────────────────────────
    created_at = _to_aware(data['created_at'])
    pushed_at  = _to_aware(data['pushed_at'])
    start      = _to_aware(event_start)
    end        = _to_aware(event_end)

    # ── Rule 1: repo must have been created AFTER the event started ───────────
    if created_at < start:
        raise ValueError(
            "Invalid Project: Repository was created before the event started. "
            "Old projects are not allowed — you must create a fresh repository "
            "for this challenge."
        )

    # ── Rule 2: last push must be BEFORE or AT the deadline ──────────────────
    if pushed_at > end:
        raise ValueError(
            "Invalid Project: Last commit was made after the event deadline. "
            "Post-deadline pushes are not accepted."
        )

    return data
