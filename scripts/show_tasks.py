import argparse
import json
from util_human_id_match import human_id_match


def load_tasks(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return data["tasks"]


def filter_tasks_by_ids(tasks, ids):
    return [task for task in tasks if any(human_id_match(task["id"], id) for id in ids)]


def format_task(task, format_type):
    if format_type == "json":
        return json.dumps(task, ensure_ascii=False, indent=2)
    elif format_type == "markdown":
        return f"## {task['title']}\n\n- ID: {task['id']}\n- Status: {task['status']}\n- Description: {task['description']}\n"
    else:  # plain text
        return f"Title: {task['title']}\nID: {task['id']}\nStatus: {task['status']}\nDescription: {task['description']}\n"


def main():
    parser = argparse.ArgumentParser(
        description="タスクを指定されたフォーマットで出力します。"
    )
    parser.add_argument(
        "ids", metavar="ID", type=str, nargs="+", help="出力するタスクのID"
    )
    parser.add_argument(
        "--format",
        choices=["json", "markdown", "text"],
        default="text",
        help="出力フォーマット",
    )
    args = parser.parse_args()

    tasks = load_tasks("ai_project_manager_data/tasks/backlog.json")
    selected_tasks = filter_tasks_by_ids(tasks, args.ids)

    for task in selected_tasks:
        print(format_task(task, args.format))


if __name__ == "__main__":
    main()
