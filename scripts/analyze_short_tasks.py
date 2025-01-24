#!/usr/bin/env python3

import json
from typing import Dict, List
from dataclasses import dataclass
from datetime import datetime
import sys
from pathlib import Path

@dataclass
class TaskCategory:
    name: str
    tasks: List[Dict]
    description: str

def load_tasks(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def categorize_tasks(tasks: List[Dict]) -> Dict[str, TaskCategory]:
    categories = {
        'urgent': TaskCategory('Urgent Tasks', [], '緊急性の高いタスク - 優先して対応が必要'),
        'mobile': TaskCategory('Mobile-Friendly Tasks', [], '移動中や短時間で進められるタスク'),
        'ai_solo': TaskCategory('AI-Solo Tasks', [], 'AI単独で実行可能なタスク'),
        'deadline': TaskCategory('Deadline Tasks', [], '期限付きタスク'),
        'blocked': TaskCategory('Blocked Tasks', [], '他のタスクによってブロックされているタスク')
    }
    
    for task in tasks:
        # Skip completed tasks
        if task.get('status', '').lower() == 'done':
            continue
            
        labels = task.get('labels', [])
        assignable_to = task.get('assignable_to', [])
        
        # Urgent tasks
        if ('urgent' in labels) or ('high-priority' in labels):
            categories['urgent'].tasks.append(task)
            
        # Mobile-friendly tasks
        if ('mobile-friendly' in labels) or any(keyword in task.get('description', '').lower() 
            for keyword in ['ipad', '移動中', 'モバイル']):
            categories['mobile'].tasks.append(task)
            
        # AI-solo tasks
        if assignable_to == ['ai']:
            categories['ai_solo'].tasks.append(task)
            
        # Tasks with deadlines
        if 'due_date' in task:
            categories['deadline'].tasks.append(task)
            
        # Blocked tasks
        if task.get('status', '').lower() == 'blocked' or 'dependencies' in task:
            categories['blocked'].tasks.append(task)
    
    return categories

def format_task_info(task: Dict) -> str:
    status = task.get('status', 'Open')
    task_id = task.get('id', 'No ID')
    title = task.get('title', 'No Title')
    labels = ', '.join(task.get('labels', []))
    due_date = task.get('due_date', '')
    
    info = [f"[{status}] {task_id}: {title}"]
    if labels:
        info.append(f"  Labels: {labels}")
    if due_date:
        info.append(f"  Due: {due_date}")
    return '\n'.join(info)

def main():
    # Load tasks from backlog.json
    repo_path = Path.home() / 'repos' / 'ai_project_manager_data' / 'tasks' / 'backlog.json'
    data = load_tasks(str(repo_path))
    
    # Categorize tasks
    categories = categorize_tasks(data.get('tasks', []))
    
    # Print categorized tasks
    print("\n=== タスク分類レポート ===")
    print(f"生成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    for category in categories.values():
        if category.tasks:  # Only show categories with tasks
            print(f"\n## {category.name}")
            print(f"説明: {category.description}")
            print("\nTasks:")
            for task in category.tasks:
                print(f"\n{format_task_info(task)}")
            print("\n" + "-"*50)

if __name__ == '__main__':
    main()
