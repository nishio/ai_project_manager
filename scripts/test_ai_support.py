#!/usr/bin/env python3

import yaml
from ai_support import AITaskProcessor

def test_ai_support():
    # Load a real task from backlog.yaml
    with open('tasks/backlog.yaml', 'r') as f:
        data = yaml.safe_load(f)
    
    # Use T0001 (multilingual project) as our test case
    tasks = data.get('tasks', [])
    test_task = next(task for task in tasks if task['id'] == 'T0001')
    
    processor = AITaskProcessor()
    print('\n=== Testing Task Analysis ===')
    analyzed = processor.analyze_task(test_task)
    print(yaml.dump(analyzed.get('ai_analysis', {}), allow_unicode=True))
    
    print('\n=== Testing Project Breakdown ===')
    subtasks = processor.suggest_breakdown(test_task)
    print(yaml.dump(subtasks, allow_unicode=True))
    
    print('\n=== Testing Content Translation ===')
    translations = processor.translate_content(
        test_task['description'],
        ['en', 'zh']
    )
    print(yaml.dump(translations, allow_unicode=True))

if __name__ == '__main__':
    test_ai_support()
