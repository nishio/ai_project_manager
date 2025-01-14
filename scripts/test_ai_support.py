#!/usr/bin/env python3

import json
from ai_support import AITaskProcessor

def test_ai_support():
    # Load a real task from backlog.json
    with open("tests/data/test_backlog.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Use PROJ-001 as our test case
    tasks = data.get("tasks", [])
    test_task = next(task for task in tasks if task["id"] == "PROJ-001")
    
    processor = AITaskProcessor()
    print("\n=== Testing Task Analysis ===")
    analyzed = processor.analyze_task(test_task)
    print(json.dumps(analyzed.get("ai_analysis", {}), ensure_ascii=False, indent=2))
    
    print("\n=== Testing Project Breakdown ===")
    subtasks = processor.suggest_breakdown(test_task)
    print(json.dumps(subtasks, ensure_ascii=False, indent=2))
    
    print("\n=== Testing Content Translation ===")
    translations = processor.translate_content(
        test_task["description"],
        ["en", "zh"]
    )
    print(json.dumps(translations, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    test_ai_support()
