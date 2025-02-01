import json

# JSONファイルを読み込む
with open(
    "../ai_project_manager_data/tasks/backlog.json", "r", encoding="utf-8"
) as file:
    data = json.load(file)

# ラベルのカウントを行う
label_count = {}
for task in data["tasks"]:
    labels = task.get("labels", [])
    for label in labels:
        if label in label_count:
            label_count[label] += 1
        else:
            label_count[label] = 1

# 結果を多い順にソートして表示
sorted_labels = sorted(label_count.items(), key=lambda x: x[1], reverse=True)
for label, count in sorted_labels:
    print(f"{label}: {count}件")
