import yaml
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get data root path from environment
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_root = os.getenv("DATA_ROOT", os.path.join(os.path.dirname(REPO_ROOT), "ai_project_manager_data"))
path = os.path.join(data_root, "tasks", "backlog.yaml")

# backlog.yamlを読み込む
with open(path, "r") as file:
    data = yaml.safe_load(file)

# Convert path from .yaml to .json
json_path = path.replace(".yaml", ".json")
with open(json_path, "w") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)
