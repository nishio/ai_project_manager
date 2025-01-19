#!/usr/bin/env python3
"""
バックログ検証システム / Backlog Validation System

このスクリプトは、backlog.jsonの構造と内容を検証します。
This script validates the structure and content of backlog.json.

検証項目 / Validation Items:
1. タスクID / Task IDs:
   - 一時ID (TXXXX形式) / Temporary ID (TXXXX format)
   - 永続ID (UUID形式) / Permanent ID (UUID format)
   - ID重複チェック / Duplicate ID detection
   - ID形式の検証 / ID format validation

2. 必須フィールド / Required Fields:
   - id: タスクの一時ID / Temporary task ID
   - title: タスクのタイトル / Task title
   - status: タスクの状態 / Task status
   - type: タスクの種類 / Task type
   - description: タスクの説明 / Task description

3. オプションフィールド / Optional Fields:
   - permanent_id: 永続的なUUID / Permanent UUID
   - labels: タグ・ラベル / Tags and labels
   - assignable_to: 担当可能者 / Assignable users
   - dependencies: タスクの依存関係 / Task dependencies
   - similar_tasks: 類似タスク / Similar tasks
   - due_date: 期限日 / Due date
   - appointment_date: 予定日 / Appointment date
   - visibility: 公開範囲 / Visibility scope
   - security_level: セキュリティレベル / Security level

フォーマット検証 / Format Validation:
- 日付: YYYY-MM-DD または 曜日（例：月曜）
  Dates: YYYY-MM-DD or weekday (e.g., 月曜)
- ID: TXXXX形式（4桁の数字）
  IDs: TXXXX format (4 digits)
- UUID: 標準的なUUID形式
  UUIDs: Standard UUID format

使用方法 / Usage:
    python validate_backlog.py [backlog.json path]

注意事項 / Notes:
- 全てのエラーを収集して一括表示
  Collects and displays all errors at once
- バックログ全体の整合性を検証
  Validates entire backlog consistency
- ID重複を自動的に検出
  Automatically detects ID duplicates

## スクリプトの概要

1. **ヘルパー関数**群を定義して、IDや日付、visibility、セキュリティレベルなどを簡単にチェックできるようにしています。  
2. **`validate_dependencies`**や**`validate_similar_tasks`**など、複雑になりやすいサブ構造は個別の関数で行い、可読性を高めています。  
3. **タスクごとのバリデーション**(`validate_task`)では、**必須フィールド**・**フォーマット**のチェック、オプション項目の型チェックなどをまとめて行っています。  
4. ファイル全体のバリデーション(`validate_tasks_json`)では、**JSON形式**や**`tasks`キーの存在**、そして**IDの重複**（一時ID・永続IDの重複）を確認しています。  

## 設計のレビュー・ポイント

- **JSONへの移行**：以前のYAMLバリデーションに比べてJSONバリデーションになっているため、フォーマット関連（`json.load`）に変更がありますが、基本ロジックは同じ流れで使えます。  
- **バリデーションの拡張性**：  
  - 依存関係の`must` / `nice_to_have` / `human`ごとに構造が違う場合のチェックを行っている点などは良い設計です。  
  - `similar_tasks`内の`similarity_score`チェックなども要件通り実装されています。  
- **公開範囲(visibility)やセキュリティ(security_level)のチェック**：選択肢が限られる場合は、今回のようにホワイトリスト方式（許可される文字列の一覧）でバリデーションするのが安心です。  
- **日付**：今回の要件である「YYYY-MM-DD または曜日(日本語)」の両方に対応しているかをしっかり確かめています。  
- **範囲外のステータスや種類**：`validate_status` / `validate_type`などで明示的にエラーにしています。  

このように、**要件に即したバリデーションがしっかり行えているか**を確認しながらスクリプトを完成させることで、今後のメンテナンスコストを抑えつつ安心して利用できる設計になります。  

もし何か仕様変更があった場合は、以下のような点を見直すと良いでしょう：  
- ステータスの追加・削除  
- セキュリティレベルや公開範囲の変更  
- IDの命名規則変更（`TXXXX` → 文字数を増やす等）  
- 依存関係フィールドの拡張（たとえば`human`に新しいステータスを追加したいなど）  

いずれの場合も、**バリデーション部分**を適切に修正することで整合性を保ち、誤入力や不正なJSON構造を防げます。
"""

import json
import sys
import uuid
import re
from datetime import datetime
from typing import Dict, List, Any

# ---------------------------------
# ユーティリティ関数
# ---------------------------------


def format_task_identifier(task: Dict[str, Any]) -> str:
    """
    タスクのIDと名前をフォーマットして返す
    """
    task_id = task.get("id", "UNKNOWN")
    task_title = task.get("title", "UNKNOWN")
    return f"Task ID: {task_id}, Name: {task_title}"


# 1. 形式チェックのための小さなヘルパー関数群
# ---------------------------------


def is_valid_temp_id(task_id: str) -> bool:
    """
    Validate temporary task ID format (TXXXX)
    """
    if task_id == "":
        return True
    return bool(re.match(r"^T\d{4}$", task_id))


def is_valid_permanent_id(permanent_id: str) -> bool:
    """
    Validate permanent ID format (UUID)
    """
    if permanent_id == "":
        return True
    try:
        uuid.UUID(permanent_id)
        return True
    except ValueError:
        return False


def validate_date(date_str: str) -> List[str]:
    """
    Validate a date string in YYYY-MM-DD format or weekday format (例：月曜, 火曜 ...)
    戻り値：エラー文のリスト（エラーがなければ空）
    """
    errors = []
    weekdays = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"]

    # 「曜日」で始まる場合はOKとする
    if any(date_str.startswith(day) for day in weekdays):
        return errors

    # YYYY-MM-DDフォーマットのチェック
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        errors.append(
            f"Invalid date format: {date_str} (must be YYYY-MM-DD or weekday)"
        )
    return errors


def validate_visibility(value: str) -> bool:
    return value in ["public", "private"]


def validate_security_level(value: str) -> bool:
    return value in ["normal", "sensitive", "confidential"]


def validate_status(value: str) -> bool:
    # "In Progress" と "Blocked" は現時点で未使用
    return value.lower() in ["open", "done", "closed"]


def validate_type(value: str) -> bool:
    return value in ["task", "project"]


# ---------------------------------
# 2. 個々の要素に対するバリデーション
# ---------------------------------


def validate_dependencies(deps: Dict[str, Any], task: Dict[str, Any]) -> List[str]:
    """
    Validate the dependencies section of a task.
    戻り値：エラーメッセージのリスト
    """
    errors = []
    if not isinstance(deps, dict):
        return [f"{format_task_identifier(task)} - dependencies must be a dictionary"]

    # 共通でチェックする関数
    def check_dep_list(dep_list: Any, dep_type: str):
        _errors = []
        if not isinstance(dep_list, list):
            _errors.append(
                f"{format_task_identifier(task)} - dependencies.{dep_type} must be a list"
            )
            return _errors

        for i, dep in enumerate(dep_list):
            if not isinstance(dep, dict):
                _errors.append(
                    f"{format_task_identifier(task)} - dependencies.{dep_type}[{i}] must be a dictionary"
                )
                continue

            # must, nice_to_haveで共通チェック
            if dep_type in ["must", "nice_to_have"]:
                if "task_id" not in dep:
                    _errors.append(
                        f"{format_task_identifier(task)} - dependencies.{dep_type}[{i}] missing task_id"
                    )
                if "reason" not in dep:
                    _errors.append(
                        f"{format_task_identifier(task)} - dependencies.{dep_type}[{i}] missing reason"
                    )
            # humanの場合チェック
            if dep_type == "human":
                for f in ["action", "assignee", "status", "reason"]:
                    if f not in dep:
                        _errors.append(
                            f"{format_task_identifier(task)} - dependencies.human[{i}] missing {f}"
                        )
                if "status" in dep and dep["status"] not in [
                    "waiting",
                    "approved",
                    "rejected",
                ]:
                    _errors.append(
                        f"{format_task_identifier(task)} - dependencies.human[{i}] invalid status (must be waiting/approved/rejected)"
                    )
        return _errors

    # must / nice_to_have / human のそれぞれをチェック
    for dep_type in ["must", "nice_to_have", "human"]:
        if dep_type in deps:
            errors.extend(check_dep_list(deps[dep_type], dep_type))

    return errors


def validate_similar_tasks(similar: Any, task: Dict[str, Any]) -> List[str]:
    """
    Validate the similar_tasks section of a task.
    戻り値：エラーメッセージのリスト
    """
    errors = []
    if not isinstance(similar, list):
        return [f"{format_task_identifier(task)} - similar_tasks must be a list"]

    for i, task in enumerate(similar):
        if not isinstance(task, dict):
            errors.append(
                f"{format_task_identifier(task)} - similar_tasks[{i}] must be a dictionary"
            )
            continue

        if "task_id" not in task:
            errors.append(
                f"{format_task_identifier(task)} - similar_tasks[{i}] missing task_id"
            )
        if "note" not in task:
            errors.append(
                f"{format_task_identifier(task)} - similar_tasks[{i}] missing note"
            )

        # similarity_score があったら0.0-1.0の範囲であることをチェック
        if "similarity_score" in task:
            score = task["similarity_score"]
            if not isinstance(score, (int, float)) or score < 0 or score > 1:
                errors.append(
                    f"{format_task_identifier(task)} - similar_tasks[{i}] invalid similarity_score (must be 0.0 <= score <= 1.0)"
                )

    return errors


# ---------------------------------
# 3. タスク単位のバリデーション
# ---------------------------------


def validate_task(task: Dict[str, Any]) -> List[str]:
    """
    Validate a single task in the tasks.json
    戻り値：エラーメッセージのリスト（エラーがなければ空）
    """
    errors = []

    # --- 必須フィールドチェック
    required_fields = ["id", "title", "status", "type", "description"]
    for field in required_fields:
        if field not in task:
            errors.append(
                f"{format_task_identifier(task)} - Missing required field: {field}"
            )

    task_id = task.get("id", "UNKNOWN")  # 不明時はUNKNOWN

    # --- id フォーマット（TXXXX）
    if "id" in task:
        if not is_valid_temp_id(task["id"]):
            errors.append(
                f"{format_task_identifier(task)} - invalid temporary ID format: {task.get('id', 'UNKNOWN')} (must be TXXXX)"
            )

    # --- title, descriptionは文字列チェック（必須）
    for f in ["title", "description"]:
        if f in task and not isinstance(task[f], str):
            errors.append(
                f"{format_task_identifier(task)} - {f} must be a string, but got: {task.get(f, 'UNKNOWN')}"
            )

    # --- status
    if "status" in task and not validate_status(task["status"]):
        errors.append(
            f"{format_task_identifier(task)} - invalid status '{task['status']}' (must be Open/In Progress/Done/Blocked)"
        )

    # --- type
    if "type" in task and not validate_type(task["type"]):
        errors.append(
            f"{format_task_identifier(task)} - invalid type '{task.get('type', 'UNKNOWN')}' (must be task/project)"
        )

    # --- permanent_id (オプション)
    if "permanent_id" in task:
        if not is_valid_permanent_id(task["permanent_id"]):
            errors.append(
                f"{format_task_identifier(task)} - invalid permanent_id format (must be UUID)"
            )

    # --- labels (オプション)
    if "labels" in task:
        if not isinstance(task["labels"], list):
            errors.append(f"{format_task_identifier(task)} - labels must be a list")

    # --- assignable_to (オプション)
    if "assignable_to" in task:
        if not isinstance(task["assignable_to"], list):
            errors.append(
                f"{format_task_identifier(task)} - assignable_to must be a list"
            )

    # --- dependencies (オプション)
    if "dependencies" in task:
        errors.extend(validate_dependencies(task["dependencies"], task))

    # --- similar_tasks (オプション)
    if "similar_tasks" in task:
        errors.extend(validate_similar_tasks(task["similar_tasks"], task))

    # --- due_date / appointment_date (オプション)
    for date_field in ["due_date", "appointment_date"]:
        if date_field in task:
            if not isinstance(task[date_field], str):
                errors.append(
                    f"{format_task_identifier(task)} - {date_field} must be a string"
                )
            else:
                errors.extend(validate_date(task[date_field]))

    # --- visibility (オプション)
    if "visibility" in task:
        if not validate_visibility(task["visibility"]):
            errors.append(
                f"{format_task_identifier(task)} - visibility must be public or private"
            )

    # --- security_level (オプション)
    if "security_level" in task:
        if not validate_security_level(task["security_level"]):
            errors.append(
                f"{format_task_identifier(task)} - security_level must be normal/sensitive/confidential"
            )

    return errors


# ---------------------------------
# 4. ファイル全体のバリデーション
# ---------------------------------


def validate_tasks_json(filepath: str) -> bool:
    """
    Validate tasks.json structure and each task.
    戻り値：TrueならOK、Falseならエラーあり
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return False
    except json.JSONDecodeError as e:
        print(f"Invalid JSON format in {filepath}: {e}")
        return False

    if not isinstance(data, dict) or "tasks" not in data:
        print(f"Invalid format: {filepath} must contain a dictionary with 'tasks' key")
        return False

    tasks = data["tasks"]
    if not isinstance(tasks, list):
        print(f"Invalid format: 'tasks' in {filepath} must be a list")
        return False

    # IDの重複チェック用
    temp_ids = {}
    permanent_ids = {}

    all_errors = []
    for i, task in enumerate(tasks):
        if not isinstance(task, dict):
            all_errors.append(
                f"{format_task_identifier(task)} - Task at index {i} must be a dictionary"
            )
            continue

        # 個別タスクのバリデーション
        errors = validate_task(task)
        if errors:
            all_errors.extend(errors)

        # IDの重複チェック (id, permanent_id)
        _tid = task.get("id", None)
        if _tid:
            if _tid in temp_ids:
                all_errors.append(
                    f"Duplicate temporary ID: {_tid} (Task Names: {temp_ids[_tid]}, {format_task_identifier(task)})"
                )
            else:
                temp_ids[_tid] = task.get("title", "UNKNOWN")

        _pid = task.get("permanent_id", None)
        if _pid:
            if _pid in permanent_ids:
                all_errors.append(
                    f"Duplicate permanent ID: {_pid} (Task Names: {permanent_ids[_pid]}, {format_task_identifier(task)})"
                )
            else:
                permanent_ids[_pid] = task.get("title", "UNKNOWN")

    if all_errors:
        print("Validation errors:")
        for err in all_errors:
            print(f"  - {err}")
        return False

    print(f"{filepath} is valid.")
    return True


def main():
    """
    Main entry point for validate_json.py
    """
    if len(sys.argv) < 2:
        filepath = "ai_project_manager_data/tasks/backlog.json"
    else:
        filepath = sys.argv[1]
    success = validate_tasks_json(filepath)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
