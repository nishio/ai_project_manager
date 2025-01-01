#!/usr/bin/env python3

import yaml
import os
import sys
import json
from datetime import datetime
import networkx as nx
from typing import Dict, List, Optional, Tuple

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
