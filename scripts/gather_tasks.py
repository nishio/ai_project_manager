#!/usr/bin/env python3

import yaml
import os
import sys
import json
from datetime import datetime

def load_tasks(tasks_dir: str) -> dict:
    """
    タスクディレクトリからタスク情報を読み込む
    
    Args:
        tasks_dir: タスクディレクトリのパス
        
    Returns:
        読み込んだタスク情報
    """
    backlog_path = os.path.join(tasks_dir, 'backlog.yaml')
    if not os.path.exists(backlog_path):
        return {'tasks': []}
        
    with open(backlog_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {'tasks': []}

def break_down_project(project: dict) -> list:
    """
    プロジェクトを実行可能なタスクに分解する
    
    Args: 
        project: 分解対象のプロジェクト
        
    Returns:
        分解されたタスクのリスト
    """
    tasks = [project]  # プロジェクト自体も含める
    
    for subtask in project.get('subtasks', []):
        if subtask.get('type') == 'project':
            tasks.extend(break_down_project(subtask))
        else:
            tasks.append(subtask)
            
    return tasks

def format_task_list(tasks: list) -> str:
    """
    タスクリストを読みやすい形式でフォーマットする
    
    Args:
        tasks: タスクのリスト
        
    Returns:
        フォーマットされたタスク情報
    """
    output = []
    for task in tasks:
        # 必須フィールドのみ表示（id, titleは必須）
        status = task.get('status', 'Open')
        output.append(f"[{status}] {task['id']}: {task['title']}")
        
        # オプションフィールドは存在する場合のみ表示
        if 'type' in task:
            output.append(f"  種別: {task['type']}")
        
        if 'assignable_to' in task:
            assignable = ', '.join(task['assignable_to'])
            output.append(f"  実行者: {assignable}")
        
        if 'description' in task:
            output.append(f"  説明: {task['description'].strip()}")
        
        if task.get('labels'):
            output.append(f"  ラベル: {', '.join(task['labels'])}")
        
        output.append("")
    
    return '\n'.join(output)

def main():
    # タスクディレクトリのパス
    tasks_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'tasks')
    
    # タスクの読み込み
    data = load_tasks(tasks_dir)
    
    # プロジェクトの分解とタスクの収集
    all_tasks = []
    for task in data.get('tasks', []):
        if task.get('type') == 'project':
            all_tasks.extend(break_down_project(task))
        else:
            all_tasks.append(task)
    
    # 人間が読みやすい形式で出力
    print("=== タスク一覧 ===")
    print(format_task_list(all_tasks))
    
    # JSON形式でも出力（必要に応じて）
    if '--json' in sys.argv:
        output = {
            'timestamp': datetime.now().isoformat(),
            'tasks': all_tasks
        }
        print("\n=== JSON形式 ===")
        print(json.dumps(output, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
