#!/usr/bin/env python3
"""
非構造化メモからタスクを抽出するスクリプト
Script to extract tasks from unstructured memos (e.g., chat logs)

Features:
1. 会話ログからタスクを抽出 / Extract tasks from conversation logs
2. 複数タスクの抽出に対応 / Support multiple task extraction
3. タスク元の発話を追跡 / Track source utterances
4. JSONPatch形式で出力 / Output in JSONPatch format

Usage:
    python extract_tasks_from_chat.py [input_file]

Example:
    python extract_tasks_from_chat.py tmp_chatlog.txt
"""

import os
import sys
import json
import re
import subprocess
from datetime import datetime
from typing import List, Dict, Optional, Tuple

# Import local modules
import call_chatgpt_api
import manage_4digit_ids

# Constants
DEFAULT_INPUT = "tmp_chatlog.txt"
BACKLOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "tasks",
    "backlog.json"
)
PATCH_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "tasks",
    "patch.json"
)

def parse_chat_segment(text: str) -> List[Dict[str, str]]:
    """
    Parse chat log segments into structured format.
    Each segment should have speaker, timestamp, and content.
    
    Args:
        text (str): Raw chat log text
        
    Returns:
        List[Dict[str, str]]: List of segments with metadata
    """
    segments = []
    current_segment = {}
    
    # Split by double newlines to separate messages
    raw_segments = text.split("\n\n")
    
    for segment in raw_segments:
        if not segment.strip():
            continue
            
        # Try to extract timestamp (HH:MM format)
        timestamp_match = re.search(r"(\d{2}:\d{2})", segment)
        timestamp = timestamp_match.group(1) if timestamp_match else None
        
        # Try to extract speaker
        lines = segment.split("\n")
        speaker = None
        content = []
        
        for line in lines:
            if not line.strip():
                continue
            if not speaker and ":" in line:
                speaker, rest = line.split(":", 1)
                content.append(rest.strip())
            else:
                content.append(line.strip())
        
        if speaker and content:
            segments.append({
                "speaker": speaker.strip(),
                "timestamp": timestamp,
                "content": " ".join(content)
            })
    
    return segments

def create_task_extraction_prompt(segment: Dict[str, str]) -> str:
    """
    Create a system prompt for task extraction.
    
    Args:
        segment (Dict[str, str]): Chat segment with metadata
        
    Returns:
        str: System prompt for ChatGPT
    """
    return f"""
あなたは会話ログからタスクを抽出するAIアシスタントです。
以下の会話セグメントからタスクを抽出し、厳密なJSONPatch形式で出力してください。

【入力形式】
- 発話者: {segment['speaker']}
- タイムスタンプ: {segment['timestamp']}
- 内容: {segment['content']}

【出力形式】
厳密なJSONPatch形式で、以下の要件を満たすこと:
1. タスクIDは必ず "ID_PLACEHOLDER" を使用（システムが後で実際のIDに置換）
2. descriptionは必ず「概要」＋「詳細」の2部構成
3. 元の発話情報を必ず含める
4. statusは必ず "Open"
5. typeは必ず "task"
6. 出力は必ず配列 [] で囲む（空配列も可）
7. 各フィールドの値は必ず文字列型で出力

【出力例】
[
  {{
    "op": "add",
    "path": "/tasks/-",
    "value": {{
      "id": "ID_PLACEHOLDER",
      "title": "タスクのタイトル",
      "description": "【概要】\n要約を1-2行で書く\n\n【詳細】\n詳細な説明\n\n【出典】\n{segment['speaker']} ({segment['timestamp']}): 元の発話内容",
      "type": "task",
      "status": "Open",
      "labels": ["from_chat"],
      "assignable_to": ["human", "ai"]
    }}
  }}
]

【重要な注意事項】
1. 必ず有効なJSON形式で出力すること
2. 1つの発話から複数のタスクが抽出可能な場合は、配列内に複数のパッチを出力
3. タスクとして意味をなさない場合は空の配列 [] を返す
4. 依存関係は必須ではない（今回は実装しない）
5. 出力は必ず [] で囲まれた配列であること
6. 各フィールドの値は必ず文字列型で出力すること

あなたの役割は、与えられた会話セグメントから意味のあるタスクを抽出し、
それを正確なJSONPatch形式で出力することです。
出力形式の正確性は非常に重要です。
"""

def extract_tasks_from_segment(segment: Dict[str, str]) -> List[Dict]:
    """
    Extract tasks from a single chat segment using ChatGPT.
    
    Args:
        segment (Dict[str, str]): Chat segment with metadata
        
    Returns:
        List[Dict]: List of JSONPatch operations
    """
    system_prompt = create_task_extraction_prompt(segment)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": segment["content"]}
    ]
    
    # Call ChatGPT API
    response = call_chatgpt_api.call_chatgpt_api(messages)
    
    try:
        # Parse response as JSON
        patches = json.loads(response)
        if not isinstance(patches, list):
            print(f"Warning: Invalid response format for segment: {segment['timestamp']}")
            return []
        return patches
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON response for segment: {segment['timestamp']}")
        return []

def assign_task_ids(patches: List[Dict]) -> List[Dict]:
    """
    Replace ID_PLACEHOLDER with actual task IDs.
    
    Args:
        patches (List[Dict]): List of JSONPatch operations
        
    Returns:
        List[Dict]: Updated patches with real task IDs
    """
    updated_patches = []
    assigned_ids = set()  # Track assigned IDs for verification
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manage_ids_path = os.path.join(script_dir, "scripts", "manage_4digit_ids.py")
    
    print("\nAssigning task IDs...")
    for i, patch in enumerate(patches, 1):
        if (
            patch.get("op") == "add" 
            and "value" in patch 
            and patch["value"].get("id") == "ID_PLACEHOLDER"
        ):
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    # Get next available ID using manage_4digit_ids.py
                    result = subprocess.run(
                        [sys.executable, manage_ids_path, "next"],
                        capture_output=True,
                        text=True,
                        cwd=script_dir,
                        check=True  # Raise CalledProcessError if return code is non-zero
                    )
                    
                    new_id = result.stdout.strip()
                    if not new_id.startswith('T') or not new_id[1:].isdigit():
                        print(f"Invalid ID format received: {new_id}")
                        raise ValueError(f"Invalid ID format: {new_id}")
                    
                    if new_id in assigned_ids:
                        print(f"Warning: Duplicate ID {new_id} detected! Retrying...")
                        continue
                    
                    # Update the patch with the new ID
                    patch["value"]["id"] = new_id
                    assigned_ids.add(new_id)
                    print(f"Task {i}: Assigned ID {new_id} (Title: {patch['value'].get('title', 'Untitled')})")
                    break
                    
                except (subprocess.CalledProcessError, ValueError) as e:
                    if attempt == max_retries - 1:
                        print(f"Error getting next ID after {max_retries} attempts: {str(e)}")
                        raise RuntimeError("Failed to get next task ID") from e
                    print(f"Attempt {attempt + 1} failed, retrying...")
                    continue
            
        updated_patches.append(patch)
    
    print(f"\nTotal tasks processed: {len(patches)}")
    print(f"Unique IDs assigned: {len(assigned_ids)}")
    if len(patches) != len(assigned_ids):
        print("Warning: Number of patches does not match number of assigned IDs!")
    return updated_patches

def main():
    """Main entry point"""
    # Get input file path
    input_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    
    try:
        # Read input file
        with open(input_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Parse chat segments
        segments = parse_chat_segment(content)
        
        # Extract tasks from each segment
        all_patches = []
        for segment in segments:
            patches = extract_tasks_from_segment(segment)
            if patches:
                # Assign real task IDs
                patches = assign_task_ids(patches)
                all_patches.extend(patches)
        
        if not all_patches:
            print("No tasks extracted from the chat log.")
            return
        
        # Save patches to file
        with open(PATCH_PATH, "w", encoding="utf-8") as f:
            json.dump(all_patches, f, ensure_ascii=False, indent=2)
        
        print(f"Extracted {len(all_patches)} task patches to {PATCH_PATH}")
        print("Run apply_patch.py to apply these changes to backlog.json")
        
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
