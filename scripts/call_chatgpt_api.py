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


def call_chatgpt_api(messages, model="gpt-4"):
    """Call ChatGPT API with error handling.
    
    Args:
        messages (List[Dict]): List of message objects
        model (str): Model name (default: gpt-4)
        
    Returns:
        str: Response content from ChatGPT
        
    Raises:
        Exception: If API call fails
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling ChatGPT API: {str(e)}")
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
