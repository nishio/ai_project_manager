import os
import time
from typing import Dict, List, Optional, Tuple
import yaml
from dotenv import load_dotenv
import requests
import networkx as nx

load_dotenv()

MIRO_ACCESS_TOKEN = os.getenv("MIRO_ACCESS_TOKEN")
BOARD_ID = os.getenv("BOARD_ID")

class MiroVisualizer:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {MIRO_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        self.base_url = f"https://api.miro.com/v2/boards/{BOARD_ID}"

    def load_tasks(self, yaml_path: str) -> List[Dict]:
        """Load tasks from YAML file."""
        with open(yaml_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data["tasks"]

    def create_dependency_graph(self, tasks: List[Dict]) -> nx.DiGraph:
        """Create a directed graph representing task dependencies."""
        G = nx.DiGraph()
        for task in tasks:
            G.add_node(task["id"], **task)
            if "dependencies" in task:
                deps = task["dependencies"]
                if "must" in deps:
                    for dep in deps["must"]:
                        G.add_edge(dep["task_id"], task["id"], type="must")
                if "nice_to_have" in deps:
                    for dep in deps["nice_to_have"]:
                        G.add_edge(dep["task_id"], task["id"], type="nice_to_have")
                if "human" in deps:
                    for dep in deps["human"]:
                        G.add_edge(f"HUMAN_{dep['assignee']}", task["id"], type="human")
                        if not G.has_node(f"HUMAN_{dep['assignee']}"):
                            G.add_node(f"HUMAN_{dep['assignee']}", 
                                     type="human", 
                                     title=f"Human: {dep['assignee']}")
        return G

    def calculate_positions(self, G: nx.DiGraph) -> Dict[str, Tuple[float, float]]:
        """Calculate positions for tasks based on their dependencies."""
        positions = {}
        # プロジェクトタスクを上部に配置
        project_tasks = [n for n, d in G.nodes(data=True) 
                        if d.get("type") == "project"]
        x_spacing = 300
        y_spacing = 200
        for i, task_id in enumerate(project_tasks):
            positions[task_id] = (i * x_spacing, 0)

        # 依存関係のないタスクを左側に配置
        independent_tasks = [n for n in G.nodes() 
                           if G.in_degree(n) == 0 and n not in positions]
        for i, task_id in enumerate(independent_tasks):
            positions[task_id] = (0, (i + 1) * y_spacing)

        # 依存するタスクを右側に配置（層ごとに）
        remaining_tasks = [n for n in G.nodes() 
                         if n not in positions and not n.startswith("HUMAN_")]
        layers = list(nx.topological_generations(G.subgraph(remaining_tasks)))
        for i, layer in enumerate(layers, start=1):
            for j, task_id in enumerate(layer):
                positions[task_id] = (i * x_spacing, j * y_spacing)

        # 人的依存関係を別レイヤーとして右端に配置
        human_tasks = [n for n in G.nodes() if n.startswith("HUMAN_")]
        for i, task_id in enumerate(human_tasks):
            positions[task_id] = ((len(layers) + 1) * x_spacing, i * y_spacing)

        return positions

    def create_sticky(self, task: Dict, position: Tuple[float, float]) -> str:
        """Create a sticky note on the Miro board."""
        content = f"{task['id']}\n{task['title']}\nStatus: {task['status']}"
        data = {
            "data": {"content": content},
            "position": {"x": position[0], "y": position[1]}
        }
        print(f"Creating sticky note for task {task['id']}...")
        try:
            resp = requests.post(f"{self.base_url}/sticky_notes", 
                               json=data, headers=self.headers)
            resp.raise_for_status()
            print(f"Successfully created sticky note for task {task['id']}")
            return resp.json()["id"]
        except requests.exceptions.RequestException as e:
            print(f"Error creating sticky note for task {task['id']}: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response text: {e.response.text}")
            raise

    def create_connector(self, start_id: str, end_id: str, dep_type: str) -> None:
        """Create a connector between sticky notes."""
        style = {
            "must": {"strokeColor": "#FF0000", "strokeStyle": "normal"},
            "nice_to_have": {"strokeColor": "#0000FF", "strokeStyle": "dashed"},
            "human": {"strokeColor": "#00FF00", "strokeStyle": "normal"}
        }[dep_type]
        
        data = {
            "startItem": {"id": start_id},
            "endItem": {"id": end_id},
            "style": style
        }
        print(f"Creating {dep_type} connector between {start_id} and {end_id}...")
        try:
            resp = requests.post(f"{self.base_url}/connectors", 
                               json=data, headers=self.headers)
            resp.raise_for_status()
            print(f"Successfully created {dep_type} connector")
        except requests.exceptions.RequestException as e:
            print(f"Error creating connector: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response text: {e.response.text}")
            raise

    def visualize(self, yaml_path: str) -> None:
        """Main method to visualize tasks on Miro board."""
        tasks = self.load_tasks(yaml_path)
        G = self.create_dependency_graph(tasks)
        
        # 循環依存のチェック
        if not nx.is_directed_acyclic_graph(G):
            cycles = list(nx.simple_cycles(G))
            raise ValueError(f"循環依存が検出されました: {cycles}")
            
        positions = self.calculate_positions(G)
        
        # タスクIDとMiroのstickyIDのマッピング
        sticky_ids = {}
        
        # レート制限を考慮して一定間隔で処理
        for task_id, pos in positions.items():
            if task_id.startswith("HUMAN_"):
                task_data = G.nodes[task_id]
                sticky_ids[task_id] = self.create_sticky({
                    "id": task_id,
                    "title": task_data.get("title", f"Human: {task_id.replace('HUMAN_', '')}"),
                    "status": "N/A",
                    "type": "human"
                }, pos)
            else:
                try:
                    task = next(t for t in tasks if t["id"] == task_id)
                    sticky_ids[task_id] = self.create_sticky(task, pos)
                except StopIteration:
                    print(f"Warning: Task {task_id} not found in tasks list")
            time.sleep(0.5)  # レート制限対策
            
        # 依存関係の描画
        for u, v, data in G.edges(data=True):
            self.create_connector(sticky_ids[u], sticky_ids[v], data["type"])
            time.sleep(0.5)  # レート制限対策

if __name__ == "__main__":
    visualizer = MiroVisualizer()
    visualizer.visualize("/home/ubuntu/repos/ai_project_manager_data/tasks/backlog.yaml")
