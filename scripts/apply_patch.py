import json
import jsonpatch


def apply_json_patch(original_data_path, patch_path, output_path):
    # 元のデータを読み込む
    with open(original_data_path, "r", encoding="utf-8") as original_file:
        original_data = json.load(original_file)

    # patch.jsonを読み込む
    with open(patch_path, "r", encoding="utf-8") as patch_file:
        patch = json.load(patch_file)

    # パッチを適用
    patched_data = jsonpatch.apply_patch(original_data, patch)

    # 結果を保存
    with open(output_path, "w", encoding="utf-8") as output_file:
        json.dump(patched_data, output_file, ensure_ascii=False, indent=2)


# スクリプトの実行
apply_json_patch(
    "ai_project_manager_data/tasks/backlog.json",
    "ai_project_manager_data/tasks/patch.json",
    "ai_project_manager_data/tasks/backlog.json",
)
