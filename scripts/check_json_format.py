import json
import sys
from pathlib import Path

def check_json_format(file_path):
    """Check and enforce JSON formatting standards."""
    path = Path(file_path)
    if not path.exists():
        print(f"File not found: {file_path}")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            # インデントチェック
            if "  " not in content:
                print(f"Warning: {file_path} might not use 2-space indentation")
            # ダブルクォートチェック
            if "'" in content:
                print(f"Warning: {file_path} contains single quotes")
            # 内容の確認
            data = json.loads(content)
            # ファイルを書き直して正しいフォーマットを適用
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Checked and reformatted: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    """Check all JSON files in the project."""
    json_files = [
        "tasks/test_advanced.json",
        "tests/data/test_backlog.json",
        "tasks/backlog.json"
    ]
    
    for file_path in json_files:
        check_json_format(file_path)

if __name__ == "__main__":
    main()
