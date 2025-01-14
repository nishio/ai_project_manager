import os
import dotenv
from openai import OpenAI

dotenv.load_dotenv(verbose=True)
# ChatGPT APIキーを環境変数から取得
api_key = os.getenv("OPENAI_API_KEY")
assert api_key is not None, "API key is not set"

# クライアントのインスタンスを作る
client = OpenAI(
    api_key=api_key,
    # 必要があればエンドポイントやヘッダーもセット可能
    # base_url="https://api.openai.com/v1"
    # default_headers={"User-Agent": "my-app"}
)


def call_chatgpt_api(messages, model="gpt-4o"):
    # v1 以降は chat.completions.create(...) を呼ぶ
    response = client.chat.completions.create(model=model, messages=messages)
    # 返ってくるオブジェクトの構造は同じようなイメージ
    return response.choices[0].message.content


def role_system(prompt):
    return {"role": "system", "content": prompt}


def role_user(prompt):
    return {"role": "user", "content": prompt}


def main():
    print(
        call_chatgpt_api(
            [role_system("Translate into Japanese"), role_user("Hello, world!")]
        )
    )


if __name__ == "__main__":
    main()
