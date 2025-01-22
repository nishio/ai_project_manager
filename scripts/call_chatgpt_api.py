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
    """Call ChatGPT API with error handling and timeout.
    
    Args:
        messages (List[Dict]): List of message objects
        model (str): Model name (default: gpt-4)
        
    Returns:
        str: Response content from ChatGPT
        
    Raises:
        Exception: If API call fails or times out
    """
    import httpx
    
    base_timeout = 120.0  # Base timeout of 120 seconds
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        # Exponential backoff for timeout
        timeout = base_timeout * (2 ** attempt)
        try:
            # Set timeout for this attempt
            client.timeout = httpx.Timeout(timeout)
            
            # Print API key status (without revealing the key)
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY environment variable is not set")
            print(f"Using API key: {'*' * (len(api_key) - 4) + api_key[-4:]}")
            
            print(f"Calling ChatGPT API with model: {model} (attempt {attempt + 1}/{max_retries}, timeout: {timeout}s)")
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content
            
        except httpx.TimeoutException as e:
            last_error = e
            print(f"Warning: API call timed out after {timeout} seconds (attempt {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                print("Error: All retry attempts failed")
                raise
            print(f"Retrying with increased timeout ({timeout * 2}s)...")
            continue
        except Exception as e:
            last_error = e
            print(f"Error calling ChatGPT API: {str(e)}")
            if attempt == max_retries - 1:
                raise
            print("Retrying due to error...")
            continue
    
    # If we get here, all retries failed
    if last_error:
        raise last_error


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
