#!/usr/bin/env python3

import json
from datetime import datetime, time, timedelta
from typing import Dict, List, Tuple
from pathlib import Path

class TimeBlock:
    def __init__(self, start: time, end: time, description: str):
        self.start = start
        self.end = end
        self.description = description
        
    def duration_minutes(self) -> int:
        start_dt = datetime.combine(datetime.today(), self.start)
        end_dt = datetime.combine(datetime.today(), self.end)
        return int((end_dt - start_dt).total_seconds() / 60)
        
    def __str__(self):
        return f"{self.start.strftime('%H:%M')}-{self.end.strftime('%H:%M')} ({self.duration_minutes()}分): {self.description}"

def load_tasks(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_available_blocks() -> List[TimeBlock]:
    """現在の時刻から利用可能な作業時間枠を取得"""
    blocks = [
        TimeBlock(time(10, 45), time(12, 0), "午前の作業枠"),
        TimeBlock(time(13, 30), time(16, 0), "午後の作業枠")
    ]
    return blocks

def categorize_tasks(tasks: List[Dict]) -> Dict[str, List[Dict]]:
    """タスクを優先度とタイプで分類"""
    categories = {
        'urgent': [],
        'high_priority': [],
        'mobile': [],
        'quick': [],
        'review': []
    }
    
    for task in tasks:
        if task.get('status', '').lower() == 'done':
            continue
            
        labels = task.get('labels', [])
        desc = task.get('description', '').lower()
        
        # 緊急タスク (最優先)
        if 'urgent' in labels:
            categories['urgent'].append(task)
            continue
            
        # 高優先度タスク (次に優先)
        if 'high-priority' in labels:
            categories['high_priority'].append(task)
            continue
            
        # モバイル作業可能タスク
        if ('mobile-friendly' in labels or
            any(keyword in desc for keyword in ['ipad', '移動中', 'モバイル'])):
            categories['mobile'].append(task)
            
        # 短時間タスク
        if any(keyword in desc for keyword in ['確認', 'チェック', '見直し']):
            categories['quick'].append(task)
            
        # レビュータスク
        if ('review' in labels or 
            any(keyword in desc for keyword in ['レビュー', 'ゲラチェック'])):
            categories['review'].append(task)
    
    return categories

def suggest_schedule(blocks: List[TimeBlock], tasks: Dict[str, List[Dict]]) -> str:
    """時間枠ごとのタスク実施提案を生成"""
    output = []
    output.append("\n=== 本日の作業スケジュール提案 ===")
    output.append(f"作成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # ミーティングスケジュール
    output.append("## ミーティングスケジュール")
    output.append("- 12:00-13:00")
    output.append("- 13:00-13:30")
    output.append("- 16:00-17:00")
    output.append("- 17:00-18:00\n")
    
    # 作業可能時間枠
    output.append("## 作業可能な時間枠")
    for block in blocks:
        output.append(f"\n### {str(block)}")
        
        # 緊急・優先タスクの割り当て（各時間枠の最初に配置）
        if tasks['urgent']:
            output.append("\n優先して対応すべき緊急タスク:")
            for task in tasks['urgent']:
                output.append(f"- {task['id']}: {task['title']} (緊急)")
                
        if tasks['high_priority']:
            output.append("\n優先度の高いタスク:")
            for task in tasks['high_priority'][:2]:  # 上位2件まで
                output.append(f"- {task['id']}: {task['title']} (高優先)")
        
        # 短時間で実施可能なタスク
        if tasks['quick']:
            output.append("\n短時間で実施可能なタスク:")
            for task in tasks['quick'][:3]:  # 上位3件まで
                output.append(f"- {task['id']}: {task['title']}")
                
        # バッファ時間の確保（各時間枠の最後10分）
        output.append("\n※ 各時間枠の終了10分前はバッファとして確保")
        output.append("  - 緊急タスクの確認")
        output.append("  - 次のミーティングの準備")
    
    # モバイル作業向けタスク（移動時間用）
    if tasks['mobile']:
        output.append("\n## 移動時間に実施可能なタスク")
        for task in tasks['mobile']:
            output.append(f"- {task['id']}: {task['title']}")
    
    return '\n'.join(output)

def main():
    # タスクの読み込み
    repo_path = Path.home() / 'repos' / 'ai_project_manager_data' / 'tasks' / 'backlog.json'
    data = load_tasks(str(repo_path))
    
    # 利用可能な時間枠の取得
    blocks = get_available_blocks()
    
    # タスクの分類
    categories = categorize_tasks(data.get('tasks', []))
    
    # スケジュール提案の生成と出力
    schedule = suggest_schedule(blocks, categories)
    print(schedule)

if __name__ == '__main__':
    main()
