#!/usr/bin/env python3
"""
Validate backlog.json structure and required fields
"""

import json
import sys
import uuid
import re
from datetime import datetime
from typing import Dict, List, Any

# ---------------------------------
# 1. 形式チェックのための小さなヘルパー関数群
# ---------------------------------


def is_valid_temp_id(task_id: str) -> bool:
    """
    Validate temporary task ID format (TXXXX)
    """
    return bool(re.match(r"^T\d{4}$", task_id))


def is_valid_permanent_id(permanent_id: str) -> bool:
    """
    Validate permanent ID format (UUID)
    """
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
    return value in ["Open", "In Progress", "Done", "Blocked"]


def validate_type(value: str) -> bool:
    return value in ["task", "project"]


# ---------------------------------
# 2. 個々の要素に対するバリデーション
# ---------------------------------


def validate_dependencies(deps: Dict[str, Any], task_id: str) -> List[str]:
    """
    Validate the dependencies section of a task.
    戻り値：エラーメッセージのリスト
    """
    errors = []
    if not isinstance(deps, dict):
        return [f"Task {task_id} - dependencies must be a dictionary"]

    # 共通でチェックする関数
    def check_dep_list(dep_list: Any, dep_type: str):
        _errors = []
        if not isinstance(dep_list, list):
            _errors.append(f"Task {task_id} - dependencies.{dep_type} must be a list")
            return _errors

        for i, dep in enumerate(dep_list):
            if not isinstance(dep, dict):
                _errors.append(
                    f"Task {task_id} - dependencies.{dep_type}[{i}] must be a dictionary"
                )
                continue

            # must, nice_to_haveで共通チェック
            if dep_type in ["must", "nice_to_have"]:
                if "task_id" not in dep:
                    _errors.append(
                        f"Task {task_id} - dependencies.{dep_type}[{i}] missing task_id"
                    )
                if "reason" not in dep:
                    _errors.append(
                        f"Task {task_id} - dependencies.{dep_type}[{i}] missing reason"
                    )
            # humanの場合チェック
            if dep_type == "human":
                for f in ["action", "assignee", "status", "reason"]:
                    if f not in dep:
                        _errors.append(
                            f"Task {task_id} - dependencies.human[{i}] missing {f}"
                        )
                if "status" in dep and dep["status"] not in [
                    "waiting",
                    "approved",
                    "rejected",
                ]:
                    _errors.append(
                        f"Task {task_id} - dependencies.human[{i}] invalid status (must be waiting/approved/rejected)"
                    )
        return _errors

    # must / nice_to_have / human のそれぞれをチェック
    for dep_type in ["must", "nice_to_have", "human"]:
        if dep_type in deps:
            errors.extend(check_dep_list(deps[dep_type], dep_type))

    return errors


def validate_similar_tasks(similar: Any, task_id: str) -> List[str]:
    """
    Validate the similar_tasks section of a task.
    戻り値：エラーメッセージのリスト
    """
    errors = []
    if not isinstance(similar, list):
        return [f"Task {task_id} - similar_tasks must be a list"]

    for i, task in enumerate(similar):
        if not isinstance(task, dict):
            errors.append(f"Task {task_id} - similar_tasks[{i}] must be a dictionary")
            continue

        if "task_id" not in task:
            errors.append(f"Task {task_id} - similar_tasks[{i}] missing task_id")
        if "note" not in task:
            errors.append(f"Task {task_id} - similar_tasks[{i}] missing note")

        # similarity_score があったら0.0-1.0の範囲であることをチェック
        if "similarity_score" in task:
            score = task["similarity_score"]
            if not isinstance(score, (int, float)) or score < 0 or score > 1:
                errors.append(
                    f"Task {task_id} - similar_tasks[{i}] invalid similarity_score (must be 0.0 <= score <= 1.0)"
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
            errors.append(f"Missing required field: {field}")

    task_id = task.get("id", "UNKNOWN")  # 不明時はUNKNOWN

    # --- id フォーマット（TXXXX）
    if "id" in task:
        if not is_valid_temp_id(task["id"]):
            errors.append(
                f"Task {task_id} - invalid temporary ID format (must be TXXXX)"
            )

    # --- title, descriptionは文字列チェック（必須）
    for f in ["title", "description"]:
        if f in task and not isinstance(task[f], str):
            errors.append(f"Task {task_id} - {f} must be a string")

    # --- status
    if "status" in task and not validate_status(task["status"]):
        errors.append(
            f"Task {task_id} - invalid status (must be Open/In Progress/Done/Blocked)"
        )

    # --- type
    if "type" in task and not validate_type(task["type"]):
        errors.append(f"Task {task_id} - invalid type (must be task/project)")

    # --- permanent_id (オプション)
    if "permanent_id" in task:
        if not is_valid_permanent_id(task["permanent_id"]):
            errors.append(
                f"Task {task_id} - invalid permanent_id format (must be UUID)"
            )

    # --- labels (オプション)
    if "labels" in task:
        if not isinstance(task["labels"], list):
            errors.append(f"Task {task_id} - labels must be a list")

    # --- assignable_to (オプション)
    if "assignable_to" in task:
        if not isinstance(task["assignable_to"], list):
            errors.append(f"Task {task_id} - assignable_to must be a list")

    # --- dependencies (オプション)
    if "dependencies" in task:
        errors.extend(validate_dependencies(task["dependencies"], task_id))

    # --- similar_tasks (オプション)
    if "similar_tasks" in task:
        errors.extend(validate_similar_tasks(task["similar_tasks"], task_id))

    # --- due_date / appointment_date (オプション)
    for date_field in ["due_date", "appointment_date"]:
        if date_field in task:
            if not isinstance(task[date_field], str):
                errors.append(f"Task {task_id} - {date_field} must be a string")
            else:
                errors.extend(validate_date(task[date_field]))

    # --- visibility (オプション)
    if "visibility" in task:
        if not validate_visibility(task["visibility"]):
            errors.append(f"Task {task_id} - visibility must be public or private")

    # --- security_level (オプション)
    if "security_level" in task:
        if not validate_security_level(task["security_level"]):
            errors.append(
                f"Task {task_id} - security_level must be normal/sensitive/confidential"
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
    temp_ids = set()
    permanent_ids = set()

    all_errors = []
    for i, task in enumerate(tasks):
        if not isinstance(task, dict):
            all_errors.append(f"Task at index {i} must be a dictionary")
            continue

        # 個別タスクのバリデーション
        errors = validate_task(task)
        if errors:
            all_errors.extend(errors)

        # IDの重複チェック (id, permanent_id)
        _tid = task.get("id", None)
        if _tid and _tid in temp_ids:
            all_errors.append(f"Duplicate temporary ID: {_tid}")
        elif _tid:
            temp_ids.add(_tid)

        _pid = task.get("permanent_id", None)
        if _pid and _pid in permanent_ids:
            all_errors.append(f"Duplicate permanent ID: {_pid}")
        elif _pid:
            permanent_ids.add(_pid)

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
        print("Usage: python validate_json.py <tasks.json>")
        sys.exit(1)

    filepath = sys.argv[1]
    success = validate_tasks_json(filepath)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
