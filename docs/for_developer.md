# 開発者向けガイド

このドキュメントは未整理である
既存のREADMEから関連する部分が移植されている

---

必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- 開発環境のセットアップ

注意：このシステムは Ubuntu 22.04.5 LTS (x86_64) で開発・テストされています。
Macユーザーは追加の設定が必要です。


```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git

# 4. 開発用環境変数の設定
export OPENAI_API_KEY=your_api_key
export USE_TEST_DATA=true  # テストデータを使用
export DATA_ROOT=/path/to/ai_project_manager_data  # ai_project_manager_dataの絶対パス
```

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
cd ai_project_manager

# 2. 環境のセットアップ
## Ubuntu/Debian の場合
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Mac の場合
./setup_mac.sh  # graphvizのインストールとvenv環境のセットアップを行います

# 3. 環境変数の設定
## OpenAI APIキーの設定
export OPENAI_API_KEY=your_api_key

## データディレクトリの設定
# ai_project_manager_dataをクローンした絶対パスを指定
export DATA_ROOT=/path/to/ai_project_manager_data  # 例: /home/user/repos/ai_project_manager_data

# 4. タスクデータの取得と確認
python scripts/upkeep_data.py
```
