import os
import subprocess


def update_or_clone_repo():
    repo_path = "ai_project_manager_data"
    repo_url = "git@github.com:nishio/ai_project_manager_data.git"

    if os.path.exists(repo_path):
        # ディレクトリが存在する場合、git pullを実行
        subprocess.run(["git", "-C", repo_path, "pull"], check=True)
    else:
        # ディレクトリが存在しない場合、git cloneを実行
        subprocess.run(["git", "clone", repo_url], check=True)


if __name__ == "__main__":
    update_or_clone_repo()
