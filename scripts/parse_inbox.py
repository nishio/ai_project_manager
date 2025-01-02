#!/usr/bin/env python3
import re
import yaml
from datetime import datetime
from typing import Dict, Optional, Tuple

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

def generate_task_id() -> str:
    """Generate a unique task ID in TXXXX format."""
    # In a real implementation, this would need to check existing IDs
    # For now, we'll use a timestamp-based ID
    from datetime import datetime
    timestamp = datetime.now().strftime("%H%M%S")
    return f"T{timestamp}"

def convert_freeform_to_yaml(text: str) -> Dict:
    """
    Convert freeform text to a structured task dictionary.
    Example input: "月曜に歯医者の予約の電話をする"
    """
    # Detect date and determine if it's a due date or appointment
    due_date, appointment_date, text_without_date = detect_date(text)
    
    # Create basic task structure
    task = {
        "id": generate_task_id(),
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

def parse_inbox_text(text: str) -> str:
    """
    Parse freeform text and return YAML string.
    """
    task = convert_freeform_to_yaml(text)
    return yaml.dump({"tasks": [task]}, allow_unicode=True, sort_keys=False)

if __name__ == "__main__":
    # Example usage
    example_text = "月曜に歯医者の予約の電話をする"
    yaml_output = parse_inbox_text(example_text)
    print(yaml_output)
