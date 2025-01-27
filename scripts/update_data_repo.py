"""
このスクリプトは、指定されたGitリポジトリディレクトリに移動し、変更をステージングしてコミットし、
リモートリポジトリにプッシュするためのものです。`git status`で変更を確認し、`git add -u`で
変更をステージングし、`git commit`でコミットメッセージを付けてコミットし、`git push`で
リモートにプッシュします。
"""

import os
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def update_or_clone_repo():
    # Get data repository path from environment variable
    repo_path = os.getenv("DATA_ROOT", "../ai_project_manager_data")
    os.chdir(repo_path)
    subprocess.run(["git", "status"], check=True)
    subprocess.run(["git", "add", "-u"], check=True)
    subprocess.run(["git", "commit", "-m", "update"], check=True)
    subprocess.run(["git", "push"], check=True)


if __name__ == "__main__":
    update_or_clone_repo()
