from config import Protocols
import requests
import re
import base64
import datetime
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse


class SubscriptionFetcher(Protocols):
    def __init__(self, urls: list, max_workers: int = 10) -> None:
        Protocols.__init__(self)
        self.urls = urls
        self.max_workers = max_workers
        self.lock = threading.Lock()
        self._all_ss = []
        self._all_vless = []
        self._all_vmess = []
        self._all_trojan = []
        self.__fetch_all()

        # Set combined results to Protocols instance
        self.ss = self._all_ss
        self.vless = self._all_vless
        self.vmess = self._all_vmess
        self.trojan = self._all_trojan

    def _fetch_url(self, url: str) -> None:
        print(f'Fetching subscription from: {url}')
        parsed_url = urlparse(url)
        domain_tag = parsed_url.netloc.replace(':', '_') if parsed_url.netloc else "web"

        text = None
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        for retry in range(3):
            try:
                response = requests.get(url, headers=headers, timeout=15)
                if response.status_code == 200:
                    text = response.text
                    break
            except Exception:
                pass

        if not text:
            print(f"Failed to retrieve subscription from {url}")
            return

        # Check if content is Base64 encoded
        decoded_text = self._try_base64_decode(text)
        content = decoded_text if decoded_text else text

        scrape_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        post_date = datetime.datetime.now().strftime("%Y-%m-%d")

        ss_links = []
        vless_links = []
        vmess_links = []
        trojan_links = []

        for line in content.splitlines():
            line = line.strip()
            if not line:
                continue

            if line.startswith("ss://"):
                ss_links.append(self._format_link(line, domain_tag, post_date, scrape_date))
            elif line.startswith("vless://"):
                vless_links.append(self._format_link(line, domain_tag, post_date, scrape_date))
            elif line.startswith("vmess://"):
                vmess_links.append(self._format_link(line, domain_tag, post_date, scrape_date))
            elif line.startswith("trojan://"):
                trojan_links.append(self._format_link(line, domain_tag, post_date, scrape_date))

        with self.lock:
            self._all_ss.extend(ss_links)
            self._all_vless.extend(vless_links)
            self._all_vmess.extend(vmess_links)
            self._all_trojan.extend(trojan_links)

    def _format_link(self, link: str, domain_tag: str, post_date: str, scrape_date: str) -> str:
        # If link already has a remark tag (#...), append metadata to it or create one
        if "#" in link:
            base_link, tag = link.split("#", 1)
            return f"{base_link}#{tag}|channel:ext_{domain_tag}|post_date:{post_date}|scrape_date:{scrape_date}"
        else:
            return f"{link}#channel:ext_{domain_tag}|post_date:{post_date}|scrape_date:{scrape_date}"

    @staticmethod
    def _try_base64_decode(text: str) -> str:
        cleaned = text.strip()
        # Fast check if it doesn't start with protocol tags
        if any(cleaned.startswith(p) for p in ["vless://", "vmess://", "ss://", "trojan://"]):
            return None

        try:
            # Fix base64 padding if needed
            missing_padding = len(cleaned) % 4
            if missing_padding:
                cleaned += '=' * (4 - missing_padding)
            decoded_bytes = base64.b64decode(cleaned)
            decoded_str = decoded_bytes.decode('utf-8', errors='ignore')
            # Validate if decoded string contains protocols
            if any(p in decoded_str for p in ["vless://", "vmess://", "ss://", "trojan://"]):
                return decoded_str
        except Exception:
            pass
        return None

    def __fetch_all(self) -> None:
        if not self.urls:
            return
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            executor.map(self._fetch_url, self.urls)
