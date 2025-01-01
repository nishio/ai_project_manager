#!/usr/bin/env python3

import networkx as nx
from graphviz import Digraph
import yaml
from typing import Dict, List, Optional
import os

def load_tasks(file_path: str) -> List[Dict]:
    """YAMLファイルからタスクデータを読み込む"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
        if not isinstance(data, dict) or 'tasks' not in data:
            raise ValueError(f"Expected a dict with 'tasks' key in {file_path}")
        return data['tasks']

def create_task_graph(tasks: List[Dict]) -> nx.DiGraph:
    """タスクの依存関係からグラフを作成"""
    G = nx.DiGraph()
    
    # ノードの追加
    for task in tasks:
        status = task.get('status', 'Unknown')
        task_type = task.get('type', 'task')
        G.add_node(task['id'], 
                  title=task['title'],
                  status=status,
                  type=task_type)
    
    # エッジの追加
    for task in tasks:
        task_id = task['id']
        deps = task.get('dependencies', {})
        
        # MUST依存
        for dep in deps.get('must', []):
            G.add_edge(dep['task_id'], task_id, 
                      dependency_type='MUST',
                      reason=dep.get('reason', ''))
        
        # NICE TO HAVE依存
        for dep in deps.get('nice_to_have', []):
            G.add_edge(dep['task_id'], task_id,
                      dependency_type='NICE_TO_HAVE',
                      reason=dep.get('reason', ''))
        
        # 人的依存
        for dep in deps.get('human', []):
            human_id = f"HUMAN_{dep['assignee']}_{task_id}"
            G.add_node(human_id,
                      type='human',
                      action=dep['action'],
                      status=dep.get('status', 'waiting'))
            G.add_edge(human_id, task_id,
                      dependency_type='HUMAN',
                      reason=dep.get('reason', ''))

    return G

def visualize_task_graph(G: nx.DiGraph, output: str = "task_graph"):
    """グラフを可視化してファイルに出力"""
    dot = Digraph('Tasks')
    dot.attr(rankdir='LR')  # 左から右へのレイアウト
    
    # ノードスタイルの定義
    dot.attr('node', shape='box', style='rounded')
    
    # ノードの追加
    for node in G.nodes:
        attrs = G.nodes[node]
        if attrs.get('type') == 'human':
            # 人的依存のノード
            label = f"{attrs['action']}\n({attrs['status']})"
            dot.node(node, label, shape='ellipse', style='filled', 
                    fillcolor='lightblue')
        else:
            # タスクノード
            label = f"{node}: {attrs['title']}\n({attrs['status']})"
            fillcolor = 'lightgreen' if attrs['type'] == 'project' else 'white'
            dot.node(node, label, fillcolor=fillcolor, 
                    style='filled' if fillcolor != 'white' else '')
    
    # エッジの追加
    for u, v, data in G.edges(data=True):
        dep_type = data['dependency_type']
        reason = data.get('reason', '')
        
        # 依存タイプに応じたエッジスタイル
        if dep_type == 'MUST':
            dot.edge(u, v, f"{dep_type}\n{reason}", color='red')
        elif dep_type == 'NICE_TO_HAVE':
            dot.edge(u, v, f"{dep_type}\n{reason}", color='blue', style='dashed')
        else:  # HUMAN
            dot.edge(u, v, reason, color='green')
    
    # グラフの出力
    dot.render(output, format='png', cleanup=True)

def main():
    """メイン処理"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backlog_path = os.path.join(script_dir, '..', 'tasks', 'backlog.yaml')
    output_path = os.path.join(script_dir, '..', 'tasks', 'task_graph')
    
    tasks = load_tasks(backlog_path)
    G = create_task_graph(tasks)
    visualize_task_graph(G, output_path)
    print(f"タスクグラフを {output_path}.png に出力しました")

if __name__ == '__main__':
    main()
