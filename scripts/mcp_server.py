"""MCP server implementation for ai_project_manager."""

import asyncio
import json
import os
from typing import List, Dict, Any

import mcp.types as types
from mcp.server import Server
from mcp.server.stdio import stdio_server

from call_chatgpt_api import call_chatgpt_api, role_system, role_user
from extract_tasks_from_chat import extract_tasks_from_segment, generate_task_extraction_prompt
from show_next_action import SYSTEM as NEXT_ACTION_SYSTEM


class TaskManagementServer:
    """MCP server for task management operations."""
    
    def __init__(self):
        self.server = Server("ai_project_manager")
        self.setup_tools()
    
    def setup_tools(self):
        """Set up available tools for the server."""
        
        @self.server.list_tools()
        async def list_tools() -> list[types.Tool]:
            """List available tools."""
            return [
                types.Tool(
                    name="extract_tasks",
                    description="Extract tasks from chat content",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "content": {"type": "string", "description": "Chat content to extract tasks from"},
                            "speaker": {"type": "string", "description": "Speaker of the chat content"},
                            "timestamp": {"type": "string", "description": "Timestamp of the chat content"}
                        },
                        "required": ["content"]
                    }
                ),
                types.Tool(
                    name="get_next_actions",
                    description="Get recommended next actions based on current backlog",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "backlog_data": {"type": "object", "description": "Current backlog data"}
                        },
                        "required": ["backlog_data"]
                    }
                ),
                types.Tool(
                    name="load_backlog",
                    description="Load the current backlog data",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
            """Handle tool calls."""
            if name == "extract_tasks":
                return await self.extract_tasks(arguments)
            elif name == "get_next_actions":
                return await self.get_next_actions(arguments)
            elif name == "load_backlog":
                return await self.load_backlog()
            else:
                raise ValueError(f"Unknown tool: {name}")
    
    async def extract_tasks(self, arguments: dict) -> list[types.TextContent]:
        """Extract tasks from chat content."""
        content = arguments.get("content", "")
        speaker = arguments.get("speaker", "unknown")
        timestamp = arguments.get("timestamp", "")
        
        segment = {
            "content": content,
            "speaker": speaker,
            "timestamp": timestamp
        }
        
        tasks = extract_tasks_from_segment(segment)
        
        return [types.TextContent(type="text", text=json.dumps(tasks))]
    
    async def get_next_actions(self, arguments: dict) -> list[types.TextContent]:
        """Get recommended next actions."""
        backlog_data = arguments.get("backlog_data", {})
        
        messages = [
            role_system(NEXT_ACTION_SYSTEM),
            {"role": "user", "content": str(backlog_data)}
        ]
        
        result = call_chatgpt_api(messages)
        
        return [types.TextContent(type="text", text=result)]
    
    async def load_backlog(self) -> list[types.TextContent]:
        """Load the current backlog data."""
        data_root = os.getenv("DATA_ROOT", "/home/ubuntu/repos/ai_project_manager_data")
        backlog_path = os.path.join(data_root, "tasks", "backlog.json")
        
        try:
            with open(backlog_path, "r", encoding="utf-8") as f:
                backlog_data = json.load(f)
            return [types.TextContent(type="text", text=json.dumps(backlog_data))]
        except Exception as e:
            return [types.TextContent(type="text", text=f"Error loading backlog: {str(e)}")]
    
    async def run(self):
        """Run the MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options()
            )


async def main():
    """Main entry point."""
    server = TaskManagementServer()
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
