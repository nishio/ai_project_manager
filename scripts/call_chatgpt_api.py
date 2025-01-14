import openai
import os
import yaml

# ChatGPT APIキーとエンドポイントを環境変数から取得
api_key = os.getenv("OPENAI_API_KEY")
api_endpoint = os.getenv(
    "OPENAI_API_ENDPOINT", "https://api.openai.com/v1/chat/completions"
)


# システムプロンプトを設定する関数
def set_system_prompt(prompt):
    return {"role": "system", "content": prompt}


# backlog.yamlの内容を読み込む
def read_backlog(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


# ChatGPT APIを呼び出す関数
def call_chatgpt_api(messages, model="gpt-4o"):
    openai.api_key = api_key
    response = openai.ChatCompletion.create(model=model, messages=messages)
    return response.choices[0].message["content"]


# メイン処理
def main():
    # システムプロンプトを設定
    system_prompt = set_system_prompt("ここにシステムプロンプトを設定してください")

    # backlog.yamlの内容を取得
    backlog_data = read_backlog("ai_project_manager_data/tasks/backlog.yaml")

    # メッセージを構築
    messages = [system_prompt, {"role": "user", "content": str(backlog_data)}]

    # ChatGPT APIを呼び出し、結果を取得
    result = call_chatgpt_api(messages)
    print("API Result:", result)


if __name__ == "__main__":
    main()
