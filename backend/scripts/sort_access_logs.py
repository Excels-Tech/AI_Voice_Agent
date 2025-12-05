import argparse
import sys
from datetime import datetime
from typing import List, Optional, Tuple


def parse_timestamp(line: str) -> Optional[datetime]:
    """
    Parse the leading ISO-8601 timestamp in a log line.
    Supports both fractional seconds and a trailing Z for UTC.
    Returns None when no timestamp is found.
    """
    if not line:
        return None

    first_token = line.split()[0]
    ts_token = first_token.replace("Z", "+00:00") if first_token.endswith("Z") else first_token

    try:
        return datetime.fromisoformat(ts_token)
    except ValueError:
        return None


def load_lines(path: Optional[str]) -> List[str]:
    """Read lines from a file or stdin and strip trailing newlines."""
    if path:
        with open(path, "r", encoding="utf-8") as fh:
            return [line.rstrip("\n") for line in fh.readlines()]

    return [line.rstrip("\n") for line in sys.stdin.readlines()]


def sort_lines(lines: List[str]) -> List[str]:
    """
    Sort lines by parsed timestamp, keeping original order for ties.
    Lines without a timestamp are placed after dated entries.
    """
    indexed: List[Tuple[Optional[datetime], int, str]] = []
    for idx, line in enumerate(lines):
        indexed.append((parse_timestamp(line), idx, line))

    def sort_key(entry: Tuple[Optional[datetime], int, str]):
        ts, idx, _ = entry
        # Ensure timestamped lines sort first; fallback to original order for ties.
        return (0, ts, idx) if ts else (1, idx)

    indexed.sort(key=sort_key)
    return [line for _, _, line in indexed]


def main():
    parser = argparse.ArgumentParser(
        description="Sort access log lines chronologically. Reads from a file path or stdin."
    )
    parser.add_argument("file", nargs="?", help="Path to the log file (default: stdin)")
    parser.add_argument(
        "-o",
        "--output",
        help="Optional output path. If omitted, writes to stdout.",
    )
    args = parser.parse_args()

    lines = load_lines(args.file)
    sorted_lines = sort_lines(lines)
    output = "\n".join(sorted_lines)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(output)
            if sorted_lines:
                fh.write("\n")
    else:
        sys.stdout.write(output)
        if sorted_lines:
            sys.stdout.write("\n")


if __name__ == "__main__":
    main()
