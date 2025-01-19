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


def count_tokens(messages):
    # 簡易的なトークン数推定（日本語は1文字2トークン程度として概算）
    total = 0
    for msg in messages:
        content = msg.get("content", "")
        # 日本語文字数 * 2 + 英数字文字数 * 1 で概算
        jp_chars = sum(1 for c in content if ord(c) > 127)
        en_chars = sum(1 for c in content if ord(c) <= 127)
        total += (jp_chars * 2) + en_chars
    return total

def call_chatgpt_api(messages, model="gpt-4"):
    try:
        # トークン数を推定
        estimated_tokens = count_tokens(messages)
        print(f"推定トークン数: {estimated_tokens}")
        if estimated_tokens > 6000:  # 8192の75%を上限に
            raise ValueError(f"推定トークン数が多すぎます: {estimated_tokens}")
            
        print("OpenAI APIリクエストを開始します...")
        print("モデル:", model)
        # 各呼び出しごとに新しいクライアントを作成（タイムアウト設定付き）
        client = OpenAI(
            api_key=api_key,
            timeout=60.0  # 60秒タイムアウト
        )
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
        )
        print("OpenAI APIレスポンスを受信しました")
        content = response.choices[0].message.content
        print("レスポンス長:", len(content), "文字")
        return content
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        raise


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
