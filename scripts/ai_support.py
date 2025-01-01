#!/usr/bin/env python3

import os
import json
import yaml
from typing import List, Dict, Optional
from datetime import datetime
import openai

# OpenAI APIキーの設定（環境変数から取得）
openai.api_key = os.getenv('OPENAI_API_KEY')

class AITaskProcessor:
    def __init__(self):
        self.model = "gpt-4"  # デフォルトモデル
        
    async def analyze_task(self, task: Dict) -> Dict:
        """
        タスクを分析し、AIによる提案を生成
        
        Args:
            task: 分析対象のタスク情報
            
        Returns:
            AI分析結果を含むタスク情報
        """
        prompt = f"""
タスク分析:
ID: {task['id']}
タイトル: {task['title']}
説明: {task.get('description', '')}

以下の観点で分析してください：
1. タスクの複雑さと見積もり時間
2. 必要なスキルと知識
3. 人間とAIの役割分担の提案
4. リスクと注意点

回答は以下の形式でJSON形式で返してください：
{{
    "complexity": "高/中/低",
    "estimated_hours": 数値,
    "required_skills": ["スキル1", "スキル2"],
    "ai_human_split": {{
        "ai_tasks": ["タスク1", "タスク2"],
        "human_tasks": ["タスク1", "タスク2"]
    }},
    "risks": ["リスク1", "リスク2"]
}}
"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "あなたはプロジェクトマネージャーのアシスタントです。"},
                    {"role": "user", "content": prompt}
                ]
            )
            analysis = json.loads(response.choices[0].message.content)
            task['ai_analysis'] = analysis
            return task
        except Exception as e:
            print(f"Error analyzing task: {e}")
            return task

    async def suggest_breakdown(self, project: Dict) -> List[Dict]:
        """
        プロジェクトを実行可能なタスクに分解する提案を生成
        
        Args:
            project: 分解対象のプロジェクト情報
            
        Returns:
            提案されたサブタスクのリスト
        """
        prompt = f"""
プロジェクト分解:
ID: {project['id']}
タイトル: {project['title']}
説明: {project.get('description', '')}

このプロジェクトを実行可能な具体的なタスクに分解してください。
各タスクには以下の情報を含めてください：
- タイトル
- 説明
- タイプ（task/project）
- 担当（human/ai/both）
- 優先度（high/medium/low）

回答はJSON形式で返してください。
"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "あなたはプロジェクトマネージャーのアシスタントです。"},
                    {"role": "user", "content": prompt}
                ]
            )
            subtasks = json.loads(response.choices[0].message.content)
            return subtasks
        except Exception as e:
            print(f"Error suggesting breakdown: {e}")
            return []

    async def translate_content(self, content: str, target_langs: List[str]) -> Dict[str, str]:
        """
        コンテンツを指定された言語に翻訳
        
        Args:
            content: 翻訳対象のコンテンツ
            target_langs: 翻訳先言語のリスト（例：["en", "zh", "ko", "vi"]）
            
        Returns:
            言語コードをキーとする翻訳結果の辞書
        """
        translations = {}
        lang_names = {
            "en": "English",
            "zh": "Chinese",
            "ko": "Korean",
            "vi": "Vietnamese"
        }
        
        for lang in target_langs:
            prompt = f"""
以下の日本語テキストを{lang_names.get(lang, lang)}に翻訳してください：

{content}

翻訳の際は以下の点に注意してください：
1. 文化的な文脈を考慮する
2. 専門用語は適切に翻訳する
3. 自然な表現を心がける
"""
            try:
                response = await openai.ChatCompletion.acreate(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "あなたは専門的な翻訳者です。"},
                        {"role": "user", "content": prompt}
                    ]
                )
                translations[lang] = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Error translating to {lang}: {e}")
                translations[lang] = f"Translation error: {str(e)}"
        
        return translations

async def main():
    # テスト用のタスク
    test_task = {
        "id": "T0001",
        "title": "Scrapbox情報の多言語展開",
        "description": "技術文書やブログ記事を英語、中国語に翻訳し、グローバルに展開する。",
        "type": "project"
    }
    
    processor = AITaskProcessor()
    
    # タスク分析のテスト
    analyzed_task = await processor.analyze_task(test_task)
    print("\nTask Analysis:")
    print(json.dumps(analyzed_task.get('ai_analysis', {}), indent=2, ensure_ascii=False))
    
    # プロジェクト分解のテスト
    subtasks = await processor.suggest_breakdown(test_task)
    print("\nProject Breakdown:")
    print(json.dumps(subtasks, indent=2, ensure_ascii=False))
    
    # 翻訳のテスト
    translations = await processor.translate_content(
        test_task['description'],
        ["en", "zh"]
    )
    print("\nTranslations:")
    print(json.dumps(translations, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
