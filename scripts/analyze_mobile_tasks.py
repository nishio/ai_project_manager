#!/usr/bin/env python3

import json
import sys
from datetime import datetime
from typing import Dict, List
from pathlib import Path

def analyze_mobile_tasks(tasks: List[Dict]) -> Dict[str, List[Dict]]:
    categories = {
        'mobile_ready': [],
        'quick_tasks': [],
        'review_tasks': []
    }
    
    for task in tasks:
        desc = task.get('description', '').lower()
        labels = task.get('labels', [])
        
        # Skip completed tasks
        if task.get('status', '').lower() == 'done':
            continue
            
        # Mobile-ready tasks
        if ('mobile-friendly' in labels or
            any(keyword in desc for keyword in ['ipad', '移動中', 'モバイル', 'レビュー', 'ゲラ'])):
            categories['mobile_ready'].append(task)
            
        # Quick tasks (tasks that seem doable in short time blocks)
        if any(keyword in desc for keyword in ['確認', 'チェック', '見直し', 'レビュー']):
            categories['quick_tasks'].append(task)
            
        # Review-specific tasks
        if ('review' in labels or
            any(keyword in desc for keyword in ['文字起こし見直し', 'ゲラチェック'])):
            categories['review_tasks'].append(task)
    
    return categories

def format_task(task: Dict) -> str:
    status = task.get('status', 'Open')
    task_id = task.get('id', 'No ID')
    title = task.get('title', 'No Title')
    labels = ', '.join(task.get('labels', []))
    due = task.get('due_date', '')
    
    output = [f'- [{status}] {task_id}: {title}']
    if labels:
        output.append(f'  Labels: {labels}')
    if due:
        output.append(f'  Due: {due}')
    return '\n'.join(output)

def main():
    # Load tasks from backlog.json
    repo_path = Path.home() / 'repos' / 'ai_project_manager_data' / 'tasks' / 'backlog.json'
    try:
        with open(repo_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print('Error: backlog.json not found')
        sys.exit(1)

    categories = analyze_mobile_tasks(data.get('tasks', []))

    print('\n=== モバイル作業・短時間作業向けタスク分析 ===')
    print(f'分析日時: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')

    print('\n## モバイル作業可能なタスク')
    print('iPadや移動中に実施可能なタスク:')
    for task in categories['mobile_ready']:
        print(format_task(task))

    print('\n## 短時間で実施可能なタスク')
    print('15-60分程度の時間枠で実施可能なタスク:')
    for task in categories['quick_tasks']:
        print(format_task(task))

    print('\n## レビュー系タスク')
    print('文書確認、ゲラチェックなど:')
    for task in categories['review_tasks']:
        print(format_task(task))

if __name__ == '__main__':
    main()
