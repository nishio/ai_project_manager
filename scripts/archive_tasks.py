#!/usr/bin/env python3
"""
完了タスク（status: Done）を日付別のアーカイブファイルに移動するスクリプト
使用方法：
    手動実行: python scripts/archive_tasks.py [--date YYYY-MM-DD]
    GitHub Actions: 毎朝5時に自動実行（前日までの完了タスクを移動）
"""

import argparse
import datetime
import os
import sys
import json
from typing import Dict, List, Optional, Tuple

# 設定
BACKLOG_FILE = "../ai_project_manager_data/tasks/backlog.json"  # タスクファイルのパス
ARCHIVE_DIR = "../ai_project_manager_data/tasks/archive"  # アーカイブディレクトリ
BACKUP_DIR = "../ai_project_manager_data/tasks/backup"  # バックアップディレクトリ


def create_backup(filepath: str, backup_dir: str) -> str:
    """
    ファイルのバックアップを作成
    Args:
        filepath: バックアップ対象のファイルパス
        backup_dir: バックアップディレクトリ
    Returns:
        作成したバックアップファイルのパス
    """
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(
        backup_dir, f"{os.path.basename(filepath)}.{timestamp}.bak"
    )

    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as src:
            with open(backup_path, "w", encoding="utf-8") as dst:
                dst.write(src.read())
    return backup_path


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


def save_json(data: List[Dict], filepath: str) -> None:
    """
    データをJSONファイルに保存
    Args:
        data: 保存するデータ（リスト形式）
        filepath: 保存先のファイルパス
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"tasks": data}, f, ensure_ascii=False, indent=2)


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
                    if task_due < target_date:
                        expired.append(task)
                        continue
            except ValueError:
                # 日付形式が異なる場合（例：曜日指定）は期限切れとしない
                pass
        valid.append(task)

    return expired, valid


def move_done_tasks(target_date: Optional[str] = None) -> None:
    """
    完了タスクを日付別アーカイブに移動
    Args:
        target_date: 移動先の日付（YYYY-MM-DD形式、省略時は今日）
    """
    # 日付の設定
    if target_date:
        archive_date = datetime.datetime.strptime(target_date, "%Y-%m-%d").date()
    else:
        archive_date = datetime.date.today()

    archive_file = os.path.join(
        ARCHIVE_DIR, f"{archive_date.strftime('%Y-%m-%d')}.json"
    )

    # バックアップ作成
    backup_path = create_backup(BACKLOG_FILE, BACKUP_DIR)
    print(f"Created backup: {backup_path}")

    # タスクの読み込みと分類
    tasks = load_json(BACKLOG_FILE)
    done_tasks = []
    active_tasks = []

    for task in tasks:
        if task.get("status") == "Done":
            done_tasks.append(task)
        else:
            active_tasks.append(task)

    # 期限切れタスクの確認
    expired_tasks, valid_done_tasks = check_expired_tasks(done_tasks, archive_date)

    if expired_tasks:
        print("\n期限切れタスクが見つかりました：")
        for task in expired_tasks:
            print(
                f"- {task.get('id', 'NO_ID')}: {task.get('title', 'NO_TITLE')} (期限: {task.get('due_date', 'NO_DUE_DATE')}"
            )
        print("\n期限切れタスクは人間の確認が必要です。")
        print("期限切れタスクはアーカイブされません。")

    # アーカイブの更新
    archive_tasks = load_json(archive_file)
    archive_tasks.extend(valid_done_tasks)
    save_json(archive_tasks, archive_file)

    # バックログの更新
    active_tasks.extend(expired_tasks)  # 期限切れタスクはバックログに残す
    save_json(active_tasks, BACKLOG_FILE)

    # 結果の表示
    print(f"\n処理結果:")
    print(f"- 完了タスク数: {len(done_tasks)}")
    print(f"- アーカイブ済み: {len(valid_done_tasks)}")
    print(f"- 期限切れ: {len(expired_tasks)}")
    print(f"- アーカイブファイル: {archive_file}")
    print(f"- バックアップファイル: {backup_path}")


def main():
    parser = argparse.ArgumentParser(description="完了タスクを日付別アーカイブに移動")
    parser.add_argument("--date", help="アーカイブ日付（YYYY-MM-DD形式）")
    args = parser.parse_args()

    try:
        move_done_tasks(args.date)
    except Exception as e:
        print(f"エラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
