import yaml
import json

# path = "tasks/backlog.yaml"
path = "ai_project_manager_data/tasks/backlog.yaml"
# backlog.yamlを読み込む
with open(path, "r") as file:
    data = yaml.safe_load(file)

path = path.replace(".yaml", ".json")
with open(path, "w") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)
