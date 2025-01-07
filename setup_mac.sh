#!/usr/bin/env bash
# Mac向けセットアップスクリプト
set -e

# 1. Homebrewでgraphvizをインストール（既にインストール済みならスキップ）
brew install graphviz || true

# 2. Python venv作成と有効化
python3 -m venv venv
source venv/bin/activate

# 3. 依存パッケージのインストール
pip install -r requirements.txt

# 4. セットアップ完了メッセージ
echo "セットアップが完了しました。"
echo "venv環境を有効化するには以下のコマンドを実行してください："
echo "source venv/bin/activate"
