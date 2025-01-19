#!/usr/bin/env python3

"""
期限切れタスクを確認するスクリプト
使用方法：
    手動実行: python scripts/check_expired_tasks.py [--date YYYY-MM-DD]
"""

import argparse
import datetime
import json
import os
from typing import Dict, List, Tuple

BACKLOG_FILE = "ai_project_manager_data/tasks/backlog.json"  # タスクファイルのパス


def load_json(filepath: str) -> List[Dict]:
    """
    JSONファイルを読み込む
    Args:
        filepath: JSONファイルのパス
    Returns:
        読み込んだデータ（リスト形式）
    """
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f) or {}
            if isinstance(data, dict) and "tasks" in data:
                return data["tasks"]
            return []
    return []


def check_expired_tasks(
    tasks: List[Dict], target_date: datetime.date
) -> Tuple[List[Dict], List[Dict]]:
    """
    期限切れタスクを確認
    Args:
        tasks: チェック対象のタスクリスト
        target_date: 基準日
    Returns:
        (期限切れタスク, 期限内タスク)のタプル
    """
    expired = []
    valid = []

    for task in tasks:
        due_date = task.get("due_date")
        if due_date:
            try:
                if isinstance(due_date, str):
                    task_due = datetime.datetime.strptime(due_date, "%Y-%m-%d").date()
                    if task_due < target_date and task.get("status") != "done":
                        expired.append(task)
                        continue
            except ValueError:
                # 日付形式が異なる場合（例：曜日指定）は期限切れとしない
                pass
        valid.append(task)

    return expired, valid


def main():
    parser = argparse.ArgumentParser(description="期限切れタスクを確認")
    parser.add_argument("--date", help="基準日（YYYY-MM-DD形式、省略時は今日）")
    args = parser.parse_args()

    if args.date:
        target_date = datetime.datetime.strptime(args.date, "%Y-%m-%d").date()
    else:
        target_date = datetime.date.today()

    tasks = load_json(BACKLOG_FILE)
    expired_tasks, _ = check_expired_tasks(tasks, target_date)

    if expired_tasks:
        print("\n期限切れタスクが見つかりました：")
        for task in expired_tasks:
            print(
                f"- {task.get('id', 'NO_ID')}: {task.get('title', 'NO_TITLE')} (期限: {task.get('due_date', 'NO_DUE_DATE')})"
            )
    else:
        print("期限切れタスクはありません。")


if __name__ == "__main__":
    main()
