#!/usr/bin/env python3
import re
import json
import uuid
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def detect_date(text: str) -> Tuple[Optional[str], Optional[str], str]:
    """
    Detect date references in text and determine if it's a due date or appointment date.
    Returns (due_date, appointment_date, remaining_text)
    """
    weekdays = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"]
    
    # First, check for weekday mentions
    for day in weekdays:
        if day in text:
            # Determine if it's an appointment or deadline based on context
            is_appointment = any(marker in text for marker in ["予約", "検診", "面談", "会議"])
            text_without_date = text.replace(f"{day}に", "").replace(day, "").strip()
            
            if is_appointment:
                return None, day, text_without_date
            else:
                return day, None, text_without_date
    
    # Then check for YYYY-MM-DD format dates
    date_pattern = r"(\d{4}-\d{2}-\d{2})"
    match = re.search(date_pattern, text)
    if match:
        date_str = match.group(1)
        # Validate the date
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            # Determine if it's an appointment or deadline
            is_appointment = any(marker in text for marker in ["予約", "検診", "面談", "会議"])
            text_without_date = re.sub(date_pattern, "", text).strip()
            
            if is_appointment:
                return None, date_str, text_without_date
            else:
                return date_str, None, text_without_date
        except ValueError:
            pass
    
    return None, None, text

def generate_task_id(existing_tasks: List[Dict]) -> str:
    """
    Generate a unique task ID in TXXXX format.
    Ensures uniqueness by checking existing IDs and finding the next available number.
    """
    used_numbers = {int(task['id'][1:]) for task in existing_tasks if task['id'].startswith('T')}
    next_number = 0
    while next_number < 10000:  # 4-digit limit
        if next_number not in used_numbers:
            return f"T{str(next_number).zfill(4)}"
        next_number += 1
    raise ValueError("All 4-digit task IDs (0000-9999) are in use")

def convert_freeform_to_json(text: str, existing_tasks: List[Dict]) -> Dict:
    """
    Convert freeform text to a structured task dictionary.
    Example input: "月曜に歯医者の予約の電話をする"
    """
    # Detect date and determine if it's a due date or appointment
    due_date, appointment_date, text_without_date = detect_date(text)
    
    # Create basic task structure
    task = {
        "id": generate_task_id(existing_tasks),
        "permanent_id": str(uuid.uuid4()),  # Add permanent UUID
        "title": text_without_date,
        "status": "Open",
        "type": "task",
        "description": text,  # Original text as description
    }
    
    # Add date fields if detected
    if due_date:
        task["due_date"] = due_date
    if appointment_date:
        task["appointment_date"] = appointment_date
    
    return task

def load_existing_tasks(backlog_path: str = None) -> List[Dict]:
    """
    Load existing tasks from backlog.json
    Returns empty list if file doesn't exist
    """
    if backlog_path is None:
        data_root = os.getenv("DATA_ROOT", "/home/ubuntu/repos/ai_project_manager_data")
        backlog_path = os.path.join(data_root, "tasks", "backlog.json")
    try:
        with open(backlog_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("tasks", []) if isinstance(data, dict) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def parse_inbox_text(text: str) -> str:
    """
    Parse freeform text and return JSON string.
    """
    existing_tasks = load_existing_tasks()
    task = convert_freeform_to_json(text, existing_tasks)
    return json.dumps({"tasks": [task]}, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # Example usage
    example_text = "月曜に歯医者の予約の電話をする"
    yaml_output = parse_inbox_text(example_text)
    print(yaml_output)
