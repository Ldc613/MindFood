from contextlib import closing
from pathlib import Path
import sqlite3

from flask import current_app


def get_db_connection():
    """连接 SQLite，并让查询结果可以像字典一样读取。"""
    db_path = Path(current_app.config["DATABASE"])
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def row_to_dict(row):
    return dict(row) if row else None


def fetch_all(sql, params=()):
    with closing(get_db_connection()) as conn:
        rows = conn.execute(sql, params).fetchall()
    return [row_to_dict(row) for row in rows]


def fetch_one(sql, params=()):
    with closing(get_db_connection()) as conn:
        row = conn.execute(sql, params).fetchone()
    return row_to_dict(row)

