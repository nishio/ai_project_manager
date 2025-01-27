#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime
import networkx as nx
from typing import Dict, List, Optional, Tuple
from difflib import SequenceMatcher
import re

def load_tasks(tasks_dir: str) -> dict:
    """
    タスクディレクトリからタスク情報を読み込む
    
    Args:
        tasks_dir: タスクディレクトリのパス
        
    Returns:
        読み込んだタスク情報
    """
    backlog_path = os.path.join(tasks_dir, "backlog.json")
    if not os.path.exists(backlog_path):
        return {"tasks": []}
        
    with open(backlog_path, "r", encoding="utf-8") as f:
        return json.load(f) or {"tasks": []}

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

def build_task_graph(tasks: List[Dict]) -> nx.DiGraph:
    """
    タスクの依存関係からDAG（有向非巡回グラフ）を構築する
    
    Args:
        tasks: タスクのリスト
        
    Returns:
        タスクの依存関係を表すDAG
        
    Raises:
        ValueError: 依存関係に循環が存在する場合
    """
    G = nx.DiGraph()
    
    # ノードの追加（全タスク）
    for task in tasks:
        G.add_node(task['id'], **task)
        
        # 依存関係の追加
        if 'dependencies' in task:
            deps = task['dependencies']
            
            # 必須の依存関係
            for dep in deps.get('must', []):
                G.add_edge(dep['task_id'], task['id'], 
                          dependency_type='MUST',
                          reason=dep['reason'])
            
            # あると便利な依存関係
            for dep in deps.get('nice_to_have', []):
                G.add_edge(dep['task_id'], task['id'],
                          dependency_type='NICE_TO_HAVE',
                          reason=dep['reason'])
                          
    # 循環依存のチェック
    if not nx.is_directed_acyclic_graph(G):
        cycles = list(nx.simple_cycles(G))
        raise ValueError(f"タスクグラフに循環依存が存在します: {cycles}")
        
    return G

def compute_text_similarity(text1: str, text2: str) -> float:
    """
    テキスト間の類似度を計算する
    
    Args:
        text1: 比較対象テキスト1
        text2: 比較対象テキスト2
        
    Returns:
        0.0から1.0の類似度スコア
    """
    # 前処理：空白の正規化と小文字化
    def normalize_text(text):
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text).strip().lower()
        return text
    
    text1 = normalize_text(text1)
    text2 = normalize_text(text2)
    
    if not text1 or not text2:
        return 0.0
        
    return SequenceMatcher(None, text1, text2).ratio()

def detect_similar_tasks(tasks: List[Dict], threshold: float = 0.7) -> Dict[str, List[Dict]]:
    """
    タスク間の類似性を検出する
    
    Args:
        tasks: タスクのリスト
        threshold: 類似度の閾値（0.0-1.0）
        
    Returns:
        タスクIDをキーとし、類似タスクのリストを値とする辞書
    """
    similar_tasks = {}
    
    for i, task1 in enumerate(tasks):
        for task2 in tasks[i+1:]:
            # タイトルと説明の類似度を計算
            title_sim = compute_text_similarity(task1['title'], task2['title'])
            desc_sim = compute_text_similarity(
                task1.get('description', ''),
                task2.get('description', '')
            )
            
            # タイトルか説明の類似度が閾値を超える場合
            if title_sim > threshold or desc_sim > threshold:
                # task1の類似タスクリストにtask2を追加
                if task1['id'] not in similar_tasks:
                    similar_tasks[task1['id']] = []
                similar_tasks[task1['id']].append({
                    'task_id': task2['id'],
                    'similarity_score': max(title_sim, desc_sim),
                    'note': f"タイトル類似度: {title_sim:.2f}, 説明類似度: {desc_sim:.2f}"
                })
                
                # task2の類似タスクリストにtask1を追加
                if task2['id'] not in similar_tasks:
                    similar_tasks[task2['id']] = []
                similar_tasks[task2['id']].append({
                    'task_id': task1['id'],
                    'similarity_score': max(title_sim, desc_sim),
                    'note': f"タイトル類似度: {title_sim:.2f}, 説明類似度: {desc_sim:.2f}"
                })
    
    return similar_tasks

def analyze_task_dependencies(G: nx.DiGraph) -> Tuple[List[str], Dict[str, List[Dict[str, str]]]]:
    """
    タスクの依存関係を分析する
    
    Args:
        G: タスクの依存関係を表すDAG
        
    Returns:
        (実行可能なタスク, ブロックされているタスクとその理由)
    """
    executable_tasks = []
    blocked_tasks = {}
    
    for node in G.nodes():
        task_data = G.nodes[node]
        blocking_reasons = []
        
        # 人的依存関係のチェック
        if 'dependencies' in task_data and 'human' in task_data['dependencies']:
            for dep in task_data['dependencies']['human']:
                if dep.get('status') == 'waiting':
                    blocking_reasons.append({
                        'type': 'human',
                        'assignee': dep.get('assignee'),
                        'action': dep.get('action'),
                        'reason': dep.get('reason')
                    })
        
        # タスク依存関係のチェック
        predecessors = list(G.predecessors(node))
        if predecessors:
            for pred in predecessors:
                edge_data = G.get_edge_data(pred, node)
                if edge_data['dependency_type'] == 'MUST':
                    pred_status = G.nodes[pred].get('status', 'Open')
                    if pred_status != 'Done':
                        blocking_reasons.append({
                            'type': 'task',
                            'task_id': pred,
                            'status': pred_status,
                            'reason': edge_data.get('reason', '依存タスクが未完了')
                        })
        
        if blocking_reasons:
            blocked_tasks[node] = blocking_reasons
        else:
            executable_tasks.append(node)
                
    return executable_tasks, blocked_tasks

def main():
    # タスクファイルのパス（コマンドライン引数から取得）
    if len(sys.argv) > 1:
        tasks_file = sys.argv[1]
        with open(tasks_file, "r", encoding="utf-8") as f:
            data = json.load(f) or {"tasks": []}
    else:
        # デフォルトのタスクディレクトリ
        tasks_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tasks")
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
    
    # 重複タスクを除外して類似性分析を実行
    unique_tasks = []
    seen_ids = set()
    for task in all_tasks:
        if task['id'] not in seen_ids:
            unique_tasks.append(task)
            seen_ids.add(task['id'])
    
    # タスクの類似性分析
    similar_tasks = detect_similar_tasks(unique_tasks, threshold=0.8)  # より厳密な閾値に調整
    if similar_tasks:
        print("\n=== 類似タスクの検出 ===")
        for task_id, similars in similar_tasks.items():
            task = next(t for t in unique_tasks if t['id'] == task_id)
            if similars:  # 類似タスクが存在する場合のみ表示
                print(f"\n{task_id}: {task['title']} は以下のタスクと類似:")
                for similar in similars: 
                    similar_task = next(t for t in unique_tasks if t['id'] == similar['task_id'])
                    print(f"- {similar['task_id']}: {similar_task['title']}")
                    print(f"  類似度: {similar['similarity_score']:.2f}")
                    print(f"  詳細: {similar['note']}")
    
    # グラフの構築と分析
    try:
        G = build_task_graph(all_tasks)
        executable_tasks, blocked_tasks = analyze_task_dependencies(G)
        
        print("\n=== 依存関係の分析 ===")
        print("\n実行可能なタスク:")
        for task_id in executable_tasks:
            task = G.nodes[task_id]
            print(f"- [{task.get('status', 'Open')}] {task_id}: {task['title']}")
            
        if blocked_tasks:
            print("\nブロックされているタスク:")
            for task_id, blocking_reasons in blocked_tasks.items():
                task = G.nodes[task_id]
                print(f"- {task_id}: {task['title']}")
                for reason in blocking_reasons:
                    if reason['type'] == 'task':
                        print(f"  ブロック要因(タスク): {reason['task_id']} ({reason['reason']})")
                    elif reason['type'] == 'human':
                        print(f"  ブロック要因(人的): {reason['action']} - 担当: {reason['assignee']}")
                        if reason.get('reason'):
                            print(f"    理由: {reason['reason']}")
    except ValueError as e:
        print(f"\n警告: 依存関係の分析に失敗しました - {str(e)}")
    
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
