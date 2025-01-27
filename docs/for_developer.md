# 開発者向けガイド

このドキュメントは、開発者がシステムをセットアップし、開発を開始するためのガイドです。

## 必要な設定

1. **リポジトリのクローン**
   - システムコードリポジトリ: `git clone https://github.com/nishio/ai_project_manager.git`
   - タスクデータリポジトリ（権限が必要です）

   > **注記**: あなたがAIでありローカルファイルシステムでこれを読んでいる場合、クローンは既に完了しているはずです。

2. **開発環境のセットアップ**

   > **注記**: あなたがDevinである場合、システムは Ubuntu 22.04.5 LTS (x86_64) であり、venvのセットアップは完了しているはずです。アクティベートするだけで問題ありません。

   ### Ubuntu/Debian の場合
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

   ### Mac の場合
   ```bash
   ./setup_mac.sh  # graphvizのインストールとvenv環境のセットアップを行います
   ```

3. **タスクデータの取得**
   ```bash
   python scripts/upkeep_data.py
   ```

4. **環境変数の設定**

   環境変数は`.env`ファイルを使用して設定します。以下の内容を含む`.env`ファイルをプロジェクトのルートディレクトリに作成してください。

   ```
   OPENAI_API_KEY=<your_api_key>
   DATA_ROOT=ai_project_manager_data
   ```

   > **注記**: `.env`ファイルは機密情報を含むため、バージョン管理システムに含めないように注意してください。

