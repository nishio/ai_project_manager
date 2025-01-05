#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta
from pathlib import Path
import argparse
import sys
from typing import List, Optional

def fetch_pages(project_name: str, since: Optional[datetime] = None, until: Optional[datetime] = None) -> List[dict]:
    """指定された期間のScrapboxページを取得"""
    base_url = f"https://scrapbox.io/api/{project_name}/pages"
    params = {"limit": 1000}  # 十分大きな値を設定
    
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        print(f"Error: Failed to fetch pages. Status code: {response.status_code}")
        sys.exit(1)
    
    pages = response.json()["pages"]
    filtered_pages = []
    
    for page in pages:
        updated = datetime.fromtimestamp(page["updated"] / 1000)
        if since and updated < since:
            continue
        if until and updated > until:
            continue
        filtered_pages.append(page)
    
    return filtered_pages

def fetch_page_content(project_name: str, page_title: str) -> str:
    """個別ページの内容を取得"""
    url = f"https://scrapbox.io/api/{project_name}/pages/{page_title}/text"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Warning: Failed to fetch content for {page_title}")
        return ""
    return response.text

def save_to_file(pages: list, output_dir: Path, project_name: str):
    """ページをファイルに保存"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"scrapbox_updates_{project_name}_{timestamp}.md"
    
    with open(output_file, "w", encoding="utf-8") as f:
        for page in pages:
            title = page["title"]
            created = datetime.fromtimestamp(page["created"] / 1000)
            updated = datetime.fromtimestamp(page["updated"] / 1000)
            content = fetch_page_content(project_name, title)
            
            f.write(f"# {title}\n")
            f.write(f"作成日時: {created.isoformat()}\n")
            f.write(f"更新日時: {updated.isoformat()}\n\n")
            f.write(f"{content}\n\n")
            f.write("---\n\n")

def main():
    parser = argparse.ArgumentParser(description="Collect Scrapbox page updates")
    parser.add_argument("project", help="Scrapbox project name")
    parser.add_argument("--days", type=int, help="Collect updates from the last N days")
    parser.add_argument("--date", help="Collect updates for specific date (YYYY-MM-DD)")
    parser.add_argument("--output-dir", default="collected_pages",
                      help="Output directory for collected pages")
    
    args = parser.parse_args()
    
    # 期間の設定
    now = datetime.now()
    if args.days:
        since = now - timedelta(days=args.days)
        until = now
    elif args.date:
        try:
            target_date = datetime.strptime(args.date, "%Y-%m-%d")
            since = target_date
            until = target_date + timedelta(days=1)
        except ValueError:
            print("Error: Invalid date format. Use YYYY-MM-DD")
            sys.exit(1)
    else:
        print("Error: Either --days or --date must be specified")
        sys.exit(1)
    
    # 出力ディレクトリの作成
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # ページの取得と保存
    pages = fetch_pages(args.project, since, until)
    if not pages:
        print("No updates found for the specified period")
        return
    
    save_to_file(pages, output_dir, args.project)
    print(f"Collected {len(pages)} pages")

if __name__ == "__main__":
    main()
