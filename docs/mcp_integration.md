# MCP (Model Context Protocol) 統合

このドキュメントでは、ai_project_managerプロジェクトにおけるMCP（Model Context Protocol）の統合について説明します。

## 概要

MCPは、LLM（大規模言語モデル）アプリケーションが外部データソースやツールと対話するための標準化されたプロトコルです。この統合により、以下のメリットが得られます：

1. **標準化されたプロトコル** - 異なるLLMプロバイダー間での一貫したインターフェース
2. **ツールの動的発見** - 利用可能なツールを自動的に検出して使用
3. **拡張性** - 新しいツールやリソースを簡単に追加可能
4. **コンテキスト管理の改善** - より効率的なコンテキスト処理

## 実装コンポーネント

### MCP サーバー

`scripts/mcp_server.py` は、タスク管理操作のためのMCPサーバーを実装しています。以下のツールを提供します：

- **extract_tasks** - チャットコンテンツからタスクを抽出
- **get_next_actions** - 現在のバックログに基づいて推奨される次のアクションを取得
- **load_backlog** - 現在のバックログデータを読み込み

### MCP クライアント

`scripts/mcp_client.py` は、MCPサーバーと通信するためのクライアントを実装しています。以下の機能を提供します：

- **extract_tasks** - MCPを使用してチャットコンテンツからタスクを抽出
- **get_next_actions** - MCPを使用して推奨される次のアクションを取得
- **load_backlog** - MCPを使用してバックログデータを読み込み
- **call_with_tools** - MCPツールを使用してLLMを呼び出し

### MCP対応スクリプト

既存のスクリプトをMCPに対応させた新しいバージョンを提供しています：

- **extract_tasks_from_chat_mcp.py** - MCPを使用してチャットからタスクを抽出
- **show_next_action_mcp.py** - MCPを使用して今日のタスクを推奨

## 使用方法

### 環境設定

MCPを使用するには、以下の環境変数が必要です：

- `OPENAI_API_KEY` - OpenAI APIキー
- `DATA_ROOT` - タスクデータのルートディレクトリ

### タスク抽出

```bash
python scripts/extract_tasks_from_chat_mcp.py [input_file]
```

### 今日のタスク推奨

```bash
python scripts/show_next_action_mcp.py
```

### MCP統合のテスト

```bash
python scripts/test_mcp_integration.py
```

## 拡張方法

### 新しいツールの追加

新しいツールを追加するには、`mcp_server.py`の`setup_tools`メソッドを更新します：

```python
@self.server.list_tools()
async def list_tools() -> list[types.Tool]:
    """List available tools."""
    return [
        # 既存のツール
        types.Tool(
            name="new_tool",
            description="Description of the new tool",
            inputSchema={
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Parameter 1"},
                    "param2": {"type": "string", "description": "Parameter 2"}
                },
                "required": ["param1"]
            }
        ),
    ]

@self.server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """Handle tool calls."""
    if name == "new_tool":
        return await self.new_tool(arguments)
    # 他のツール
```

そして、新しいツールのメソッドを実装します：

```python
async def new_tool(self, arguments: dict) -> list[types.TextContent]:
    """New tool implementation."""
    # ツールの実装
    return [types.TextContent(type="text", text="Result")]
```

## 注意事項

- MCPサーバーとクライアントは同じプロセス内で実行されますが、将来的には別プロセスや別マシンで実行することも可能です。
- MCPは現在も開発中のプロトコルであり、将来的に変更される可能性があります。
