import os
import subprocess
import sys


def update_repository(repo_path):
    """指定されたリポジトリの最新状態に更新する"""
    os.chdir(repo_path)
    try:
        subprocess.run(["git", "pull", "--rebase"], check=True)
        print(f"{repo_path} の更新に成功しました。")
    except subprocess.CalledProcessError:
        print(f"{repo_path} の更新に失敗しました。")


if __name__ == "__main__":
    # スクリプトの実行ディレクトリを確認
    expected_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    current_path = os.getcwd()
    if current_path != expected_path:
        print(
            f"エラー: スクリプトは{expected_path}ディレクトリから実行してください。現在のディレクトリ: {current_path}"
        )
        sys.exit(1)

    # ai_project_managerリポジトリの更新
    update_repository("../ai_project_manager")

    # ai_project_manager_dataリポジトリの更新
    update_repository("../ai_project_manager_data")
