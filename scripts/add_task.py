from common_id_utils import find_next_available_id, load_tasks, save_tasks


def add_task(title, description):
    tasks = load_tasks()
    obj = {
        "id": find_next_available_id(),
        "status": "Open",
        "title": title,
        "description": description,
    }
    tasks.append(obj)
    save_tasks(tasks)


if __name__ == "__main__":
    title = input("title>")
    description = input("description>")
    add_task(title, description)
