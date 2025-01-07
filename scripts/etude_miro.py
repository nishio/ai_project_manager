import requests

MIRO_ACCESS_TOKEN = ...
BOARD_ID = ...


def create_sticky(content, x, y):
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/sticky_notes"
    headers = {
        "Authorization": f"Bearer {MIRO_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    data = {"data": {"content": content}, "position": {"x": x, "y": y}}
    resp = requests.post(url, json=data, headers=headers)
    resp.raise_for_status()
    return resp.json()["id"]  # 作成されたstickyのID


def create_connector(start_id, end_id):
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/connectors"
    headers = {
        "Authorization": f"Bearer {MIRO_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    data = {
        "startItem": {"id": start_id},
        "endItem": {"id": end_id},
        "style": {"strokeColor": "#FF0000"},
    }
    resp = requests.post(url, json=data, headers=headers)
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    # 付箋を2つ作成
    sticky_a_id = create_sticky("付箋A", 100, 100)
    sticky_b_id = create_sticky("付箋B", 400, 100)

    # 付箋同士をコネクタで接続
    connector = create_connector(sticky_a_id, sticky_b_id)
    print("Connector created:", connector)
