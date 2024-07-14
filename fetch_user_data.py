import requests

def fetch_user_csgo_data(profile_id,season=10):
    url = f'https://csgod.top/api/profile/{profile_id}/match?season={season}&page=1'
            # https://csgod.top/api/profile/1188430506/match?season=100&page=2
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        # 可选：添加头部信息，模拟浏览器请求
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 如果请求不成功，会抛出异常
        data = response.json()  # 将响应解析为 JSON 格式
        print(data)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
def fetch_user_cs2_data(profile_id):
    url = f'https://csgod.top/api/profile/{profile_id}/match?season=100&page=1'
            # https://csgod.top/api/profile/1188430506/match?season=100&page=2
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        # 可选：添加头部信息，模拟浏览器请求
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 如果请求不成功，会抛出异常
        data = response.json()  # 将响应解析为 JSON 格式
        print(data)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

# 测试获取数据
if __name__ == "__main__":
    profile_id = "1188430506"  # 替换成实际的房间 ID
    room_data = fetch_user_cs2_data(profile_id)
    if room_data:
        print("Room Data:")
        print(room_data)