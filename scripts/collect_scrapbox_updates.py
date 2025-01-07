#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import argparse
import sys
from typing import List, Optional

def fetch_pages(project_name: str, since: Optional[datetime] = None, until: Optional[datetime] = None) -> List[dict]:
    """指定された期間のScrapboxページを取得"""
    import urllib.parse
    encoded_project = urllib.parse.quote(project_name, safe='')
    base_url = f"https://scrapbox.io/api/pages/{encoded_project}"
    params = {"limit": 1000}  # 十分大きな値を設定
    
    response = requests.get(base_url, params=params)
    print(f"Debug: Requesting URL: {base_url}")
    print(f"Debug: Response status: {response.status_code}")
    try:
        response_data = response.json()
        print(f"Debug: Response data: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
    except json.JSONDecodeError:
        print(f"Debug: Raw response: {response.text}")
        
    if response.status_code != 200:
        print(f"Error: Failed to fetch pages from {base_url}")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
    
    pages = response.json().get("pages", [])
    filtered_pages = []
    
    for page in pages:
        # APIから返されるタイムスタンプはミリ秒単位のUNIXタイムスタンプ
        # accessed（最終アクセス日時）を使用して最新の更新を判断
        timestamp = page.get("accessed", page["updated"]) / 1000
        updated = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        print(f"Debug: Page '{page.get('title')}' accessed/updated at {updated}, comparing with since={since} and until={until}")
        
        # 日付の比較（UTCタイムスタンプとして比較）
        if since and updated < since:
            print(f"Debug: Skipping - {updated} is before {since}")
            continue
        if until and updated > until:
            print(f"Debug: Skipping - {updated} is after {until}")
            continue
            
        filtered_pages.append(page)
        print(f"Debug: Added page '{page.get('title')}' to filtered pages")
    
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
    
    # 期間の設定（UTCで取得）
    now = datetime.now(timezone.utc)  # 直接UTCで取得
    if args.days:
        # 過去の日付を計算（UTCで計算）
        until = now
        since = now - timedelta(days=args.days)
        print(f"Debug: Filtering pages between {since} and {until} (UTC)")
    elif args.date:
        try:
            # 指定された日付をUTCとして解釈
            target_date = datetime.strptime(args.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            since = target_date
            until = target_date + timedelta(days=1)
            print(f"Debug: Filtering pages for date {args.date} (UTC range: {since} to {until})")
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
