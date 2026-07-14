from config import Protocols
from os import path
import requests
import re


class Telegram(Protocols):
    def __init__(self, channels: list, max_pages: int = 5) -> None:
        Protocols.__init__(self)
        self.channels = channels
        self.max_pages = max_pages
        self.__tlink = 'https://t.me/s/'
        self.__v2finder()
 
    def __v2finder(self) -> None:
        for channel in self.channels:
            print(f'searching on {channel}')
            current_url = path.join(self.__tlink, channel)
            
            for page_num in range(self.max_pages):
                page = None
                success = False
                for retry in range(3):
                    try:
                        page = requests.get(current_url, timeout=10)
                        if page.status_code == 200:
                            success = True
                            break
                    except Exception as e:
                        print(f"Retry {retry+1} failed for {current_url}: {e}")
                
                if not success or page is None:
                    print(f"Failed to retrieve page {page_num} for {channel}")
                    break

                self.ss = [f'{i[0]}{i[1]}' for i in re.findall(r"(ss://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                self.vless = [f'{i[0]}{i[1]}' for i in re.findall(r"(vless://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                self.vmess = [f'{i[0]}{i[1]}' for i in re.findall(r"(vmess://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                self.trojan = [f'{i[0]}{i[1]}' for i in re.findall(r"(trojan://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]

                # Find link to older messages (e.g., href="/s/channel?before=123")
                match = re.search(r'href="([^"]*before=\d+)"', page.text)
                if match:
                    next_href = match.group(1)
                    if next_href.startswith('/'):
                        current_url = 'https://t.me' + next_href
                    elif next_href.startswith('http'):
                        current_url = next_href
                    else:
                        current_url = path.join('https://t.me/s/', channel) + '?' + next_href.split('?')[-1]
                else:
                    break


