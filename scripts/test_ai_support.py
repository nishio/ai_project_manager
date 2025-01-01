#!/usr/bin/env python3

import asyncio
import yaml
from ai_support import AITaskProcessor

async def test_ai_support():
    # Load a real task from backlog.yaml
    with open('tasks/backlog.yaml', 'r') as f:
        tasks = yaml.safe_load(f)
    
    # Use T0001 (multilingual project) as our test case
    test_task = next(task for task in tasks if task['id'] == 'T0001')
    
    processor = AITaskProcessor()
    print('\n=== Testing Task Analysis ===')
    analyzed = await processor.analyze_task(test_task)
    print(yaml.dump(analyzed.get('ai_analysis', {}), allow_unicode=True))
    
    print('\n=== Testing Project Breakdown ===')
    subtasks = await processor.suggest_breakdown(test_task)
    print(yaml.dump(subtasks, allow_unicode=True))
    
    print('\n=== Testing Content Translation ===')
    translations = await processor.translate_content(
        test_task['description'],
        ['en', 'zh']
    )
    print(yaml.dump(translations, allow_unicode=True))

if __name__ == '__main__':
    asyncio.run(test_ai_support())
