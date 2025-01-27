"""
このスクリプトは、指定されたGitリポジトリを更新またはクローンするためのものです。
リポジトリのパスが存在する場合は、`git pull`を実行してリポジトリを最新の状態に更新します。
リポジトリのパスが存在しない場合は、`git clone`を実行してリポジトリを新たにクローンします。
"""

import os
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def update_or_clone_repo():
    # Get data repository path from environment variable
    repo_path = os.getenv("DATA_ROOT", "../ai_project_manager_data")
    repo_url = "https://github.com/nishio/ai_project_manager_data.git"

    if os.path.exists(repo_path):
        # ディレクトリが存在する場合、git pullを実行
        subprocess.run(["git", "-C", repo_path, "pull"], check=True)
    else:
        # ディレクトリが存在しない場合、git cloneを実行
        subprocess.run(["git", "clone", repo_url], check=True)


if __name__ == "__main__":
    update_or_clone_repo()
