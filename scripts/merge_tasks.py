#!/usr/bin/env python3

import yaml
import sys
from typing import Dict, List, Optional
from datetime import datetime

def load_yaml(file_path: str) -> List[Dict]:
    """YAMLファイルからタスクデータを読み込む"""
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def save_yaml(data: List[Dict], file_path: str):
    """タスクデータをYAMLファイルに保存"""
    with open(file_path, 'w') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)

def merge_tasks(task1: Dict, task2: Dict) -> Dict:
    """2つのタスクを1つに統合"""
    merged = {
        'id': f"{task1['id']}_merged_{task2['id']}",
        'title': f"{task1['title']} + {task2['title']}",
        'status': task1['status'],  # 基本的に最初のタスクのステータスを採用
        'type': task1['type'],      # 基本的に最初のタスクのタイプを採用
        'description': f"{task1['description']}\n\n=== 統合されたタスクの説明 ===\n{task2['description']}",
        'merge_history': {
            'merged_at': datetime.now().isoformat(),
            'original_tasks': [
                {'id': task1['id'], 'title': task1['title']},
                {'id': task2['id'], 'title': task2['title']}
            ]
        }
    }

    # ラベルの統合
    labels = set(task1.get('labels', []) + task2.get('labels', []))
    if labels:
        merged['labels'] = list(labels)

    # 実行者の統合
    assignable = set(task1.get('assignable_to', []) + task2.get('assignable_to', []))
    if assignable:
        merged['assignable_to'] = list(assignable)

    # 依存関係の統合
    deps1 = task1.get('dependencies', {})
    deps2 = task2.get('dependencies', {})
    
    merged_deps = {}
    for dep_type in ['must', 'nice_to_have', 'human']:
        combined = (deps1.get(dep_type, []) + deps2.get(dep_type, []))
        if combined:
            if 'dependencies' not in merged:
                merged['dependencies'] = {}
            merged['dependencies'][dep_type] = combined

    return merged

def find_task_by_id(tasks: List[Dict], task_id: str) -> Optional[Dict]:
    """タスクIDからタスクを検索"""
    for task in tasks:
        if task['id'] == task_id:
            return task
    return None

def remove_task(tasks: List[Dict], task_id: str) -> List[Dict]:
    """指定されたIDのタスクを削除"""
    return [task for task in tasks if task['id'] != task_id]

def main():
    if len(sys.argv) != 4:
        print("使用方法: python merge_tasks.py <backlog.yaml> <task_id1> <task_id2>")
        sys.exit(1)

    yaml_path = sys.argv[1]
    task_id1 = sys.argv[2]
    task_id2 = sys.argv[3]

    # タスクデータの読み込み
    tasks = load_yaml(yaml_path)

    # タスクの検索
    task1 = find_task_by_id(tasks, task_id1)
    task2 = find_task_by_id(tasks, task_id2)

    if not task1 or not task2:
        print(f"エラー: タスク {task_id1 if not task1 else task_id2} が見つかりません")
        sys.exit(1)

    # タスクの統合
    merged_task = merge_tasks(task1, task2)

    # 元のタスクを削除し、統合タスクを追加
    tasks = remove_task(tasks, task_id1)
    tasks = remove_task(tasks, task_id2)
    tasks.append(merged_task)

    # 結果の保存
    save_yaml(tasks, yaml_path)
    print(f"タスク {task_id1} と {task_id2} を統合しました")
    print(f"新しいタスクID: {merged_task['id']}")

if __name__ == "__main__":
    main()
