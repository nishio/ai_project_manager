"""
MCPの統合をテストするスクリプト
Script to test MCP integration

Usage:
    python test_mcp_integration.py
"""

import asyncio
import json
import os
from dotenv import load_dotenv

import mcp_client

load_dotenv()

async def test_extract_tasks():
    """Test task extraction with MCP"""
    print("\n=== Testing Task Extraction with MCP ===")
    
    segment = {
        "speaker": "User",
        "timestamp": "10:30",
        "content": "We need to implement the MCP integration in the ai_project_manager project."
    }
    
    client = await mcp_client.get_mcp_client()
    
    print("Extracting tasks from sample segment...")
    result = await client.extract_tasks(
        content=segment["content"],
        speaker=segment["speaker"],
        timestamp=segment["timestamp"]
    )
    
    print(f"Extracted tasks: {json.dumps(result, indent=2, ensure_ascii=False)}")
    return result

async def test_next_actions():
    """Test next actions recommendation with MCP"""
    print("\n=== Testing Next Actions with MCP ===")
    
    backlog_data = {
        "tasks": [
            {
                "id": "T0001",
                "title": "Implement MCP integration",
                "description": "Integrate MCP into the ai_project_manager project",
                "status": "Open",
                "type": "task",
                "labels": ["integration", "ai"],
                "assignable_to": ["human", "ai"]
            },
            {
                "id": "T0002",
                "title": "Test MCP integration",
                "description": "Test the MCP integration to ensure it works correctly",
                "status": "Open",
                "type": "task",
                "labels": ["testing", "ai"],
                "assignable_to": ["human", "ai"],
                "dependencies": {
                    "must": ["T0001"]
                }
            }
        ]
    }
    
    client = await mcp_client.get_mcp_client()
    
    print("Getting next actions from sample backlog...")
    result = await client.get_next_actions(backlog_data)
    
    print(f"Next actions: {result}")
    return result

async def test_load_backlog():
    """Test loading backlog with MCP"""
    print("\n=== Testing Load Backlog with MCP ===")
    
    client = await mcp_client.get_mcp_client()
    
    print("Loading backlog...")
    try:
        result = await client.load_backlog()
        print(f"Backlog loaded successfully. Found {len(result.get('tasks', []))} tasks.")
        return True
    except Exception as e:
        print(f"Error loading backlog: {str(e)}")
        return False

async def test_call_with_tools():
    """Test calling LLM with tools available"""
    print("\n=== Testing Call with Tools ===")
    
    client = await mcp_client.get_mcp_client()
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant that can extract tasks from text."},
        {"role": "user", "content": "I need to implement MCP integration and test it thoroughly."}
    ]
    
    print("Calling LLM with tools available...")
    result = await client.call_with_tools(messages)
    
    print(f"LLM response: {result}")
    return result

async def main_async():
    """Async main function"""
    try:
        await test_extract_tasks()
        await test_next_actions()
        await test_load_backlog()
        await test_call_with_tools()
        
        print("\n=== All tests completed ===")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
    finally:
        client = await mcp_client.get_mcp_client()
        await client.close()

def main():
    """Main entry point"""
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
