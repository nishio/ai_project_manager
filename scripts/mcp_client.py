"""MCP client implementation for ai_project_manager."""

import asyncio
import json
import os
from typing import List, Dict, Any

import mcp.types as types
from mcp.client import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class MCPClient:
    """MCP client for task management operations."""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.session = None
    
    async def connect(self):
        """Connect to the MCP server."""
        server_params = StdioServerParameters(
            command="python",
            args=[os.path.join(os.path.dirname(__file__), "mcp_server.py")],
            env=None
        )
        
        transport = await stdio_client(server_params)
        self.session = ClientSession(transport[0], transport[1])
        await self.session.initialize()
        
        tools = await self.session.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")
        
        return self
    
    async def extract_tasks(self, content: str, speaker: str = "unknown", timestamp: str = "") -> List[Dict]:
        """Extract tasks from chat content using MCP."""
        if not self.session:
            await self.connect()
        
        result = await self.session.call_tool(
            "extract_tasks",
            arguments={
                "content": content,
                "speaker": speaker,
                "timestamp": timestamp
            }
        )
        
        if result.content and len(result.content) > 0:
            return json.loads(result.content[0].text)
        return []
    
    async def get_next_actions(self, backlog_data: Dict) -> str:
        """Get recommended next actions using MCP."""
        if not self.session:
            await self.connect()
        
        result = await self.session.call_tool(
            "get_next_actions",
            arguments={"backlog_data": backlog_data}
        )
        
        if result.content and len(result.content) > 0:
            return result.content[0].text
        return ""
    
    async def load_backlog(self) -> Dict:
        """Load the current backlog data using MCP."""
        if not self.session:
            await self.connect()
        
        result = await self.session.call_tool(
            "load_backlog",
            arguments={}
        )
        
        if result.content and len(result.content) > 0:
            return json.loads(result.content[0].text)
        return {}
    
    async def call_with_tools(self, messages: List[Dict], model: str = "gpt-4") -> str:
        """Call OpenAI API with MCP tools available."""
        if not self.session:
            await self.connect()
        
        tools = await self.session.list_tools()
        
        functions = []
        for tool in tools:
            functions.append({
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema
            })
        
        system_message = messages[0]["content"] if messages and messages[0]["role"] == "system" else ""
        if functions:
            system_message += f"\n\nYou have access to the following tools: {json.dumps([f['name'] for f in functions])}"
            messages[0]["content"] = system_message
        
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            functions=functions if functions else None,
            function_call="auto" if functions else None
        )
        
        message = response.choices[0].message
        if message.function_call:
            function_name = message.function_call.name
            function_args = json.loads(message.function_call.arguments)
            
            tool_result = await self.session.call_tool(function_name, function_args)
            
            messages.append(message.model_dump())
            messages.append({
                "role": "function",
                "name": function_name,
                "content": tool_result.content[0].text if tool_result.content else ""
            })
            
            final_response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages
            )
            return final_response.choices[0].message.content
        
        return message.content
    
    async def close(self):
        """Close the MCP session."""
        if self.session:
            await self.session.close()


_client = None


async def get_mcp_client() -> MCPClient:
    """Get or create the MCP client instance."""
    global _client
    if _client is None:
        _client = MCPClient()
        await _client.connect()
    return _client


async def call_chatgpt_api_with_mcp(messages: List[Dict], model: str = "gpt-4") -> str:
    """Compatibility function for existing code."""
    client = await get_mcp_client()
    return await client.call_with_tools(messages, model)
