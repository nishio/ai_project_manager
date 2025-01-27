#!/usr/bin/env python3
import yaml
import json
import os

def convert_yaml_to_json(yaml_path):
    """Convert a YAML file to JSON format."""
    # Read YAML
    with open(yaml_path, "r", encoding="utf-8") as file:
        data = yaml.safe_load(file)
    
    # Write JSON
    json_path = yaml_path.replace(".yaml", ".json")
    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
    
    print(f"Converted {yaml_path} to {json_path}")
    return json_path

# Convert test files
test_files = [
    "tests/data/test_backlog.yaml",
    "tasks/test_advanced.yaml"
]

for yaml_path in test_files:
    if os.path.exists(yaml_path):
        convert_yaml_to_json(yaml_path)
