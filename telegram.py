from config import Protocols
from os import path
import requests
import re
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse


class Telegram(Protocols):
    def __init__(self, channels: list, max_pages: int = 5, max_workers: int = 20) -> None:
        Protocols.__init__(self)
        self.channels = channels
        self.max_pages = max_pages
        self.max_workers = max_workers
        self.__tlink = 'https://telegram.dog/s/'
        self.lock = threading.Lock()
        self.__v2finder()
 
    def _scrape_channel(self, channel: str) -> None:
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
                except Exception:
                    pass
            
            if not success or page is None:
                print(f"Failed to retrieve page {page_num} for {channel}")
                break

            import datetime
            scrape_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            
            ss_links = []
            vless_links = []
            vmess_links = []
            trojan_links = []
            
            parts = page.text.split('class="tgme_widget_message_wrap')
            if len(parts) > 1:
                for part in parts[1:]:
                    date_match = re.search(r'datetime="([^T"]+)', part)
                    post_date = date_match.group(1) if date_match else "Unknown"
                    
                    ss_links.extend([f'{i[0]}{i[1]}|channel:{channel}|post_date:{post_date}|scrape_date:{scrape_date}' 
                                     for i in re.findall(r"(ss://[^#\s\n]*)(\#[^\s\n<]+)", part)])
                    vless_links.extend([f'{i[0]}{i[1]}|channel:{channel}|post_date:{post_date}|scrape_date:{scrape_date}' 
                                        for i in re.findall(r"(vless://[^#\s\n]*)(\#[^\s\n<]+)", part)])
                    vmess_links.extend([f'{i[0]}{i[1]}|channel:{channel}|post_date:{post_date}|scrape_date:{scrape_date}' 
                                        for i in re.findall(r"(vmess://[^#\s\n]*)(\#[^\s\n<]+)", part)])
                    trojan_links.extend([f'{i[0]}{i[1]}|channel:{channel}|post_date:{post_date}|scrape_date:{scrape_date}' 
                                         for i in re.findall(r"(trojan://[^#\s\n]*)(\#[^\s\n<]+)", part)])
            else:
                ss_links = [f'{i[0]}{i[1]}|channel:{channel}|post_date:Unknown|scrape_date:{scrape_date}' 
                            for i in re.findall(r"(ss://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                vless_links = [f'{i[0]}{i[1]}|channel:{channel}|post_date:Unknown|scrape_date:{scrape_date}' 
                               for i in re.findall(r"(vless://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                vmess_links = [f'{i[0]}{i[1]}|channel:{channel}|post_date:Unknown|scrape_date:{scrape_date}' 
                               for i in re.findall(r"(vmess://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]
                trojan_links = [f'{i[0]}{i[1]}|channel:{channel}|post_date:Unknown|scrape_date:{scrape_date}' 
                                for i in re.findall(r"(trojan://[^#\s\n]*)(\#[^\s\n<]+)", page.text)]

            with self.lock:
                self.ss = ss_links
                self.vless = vless_links
                self.vmess = vmess_links
                self.trojan = trojan_links

            # Find link to older messages (e.g., href="/s/channel?before=123")
            match = re.search(r'href="([^"]*before=\d+)"', page.text)
            if match:
                next_href = match.group(1)
                if next_href.startswith('/'):
                    parsed_tlink = urlparse(self.__tlink)
                    current_url = f"{parsed_tlink.scheme}://{parsed_tlink.netloc}" + next_href
                elif next_href.startswith('http'):
                    current_url = next_href
                else:
                    current_url = path.join(self.__tlink, channel) + '?' + next_href.split('?')[-1]
            else:
                break

    def __v2finder(self) -> None:
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            executor.map(self._scrape_channel, self.channels)



