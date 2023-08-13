from config import Protocols
from os import path
import requests
import re


class Telegram(Protocols):
    def __init__(self, channels: list) -> None:
        Protocols.__init__(self)
        self.channels = channels
        self.__tlink = 'https://t.me/s/'
        self.__v2finder()
 
    def __v2finder(self) -> None:
        for channel in self.channels:
            print(f'searching on {channel}')
            page = requests.get(path.join(self.__tlink, channel))
            while page.status_code != 200:
                page = requests.get(path.join(self.__tlink, channel))

            self.ss = [f'{i[0]}{i[1]}' for i in re.findall("(ss:\/\/[^\#\s\n]*)(\#[^\s\n<]+)", page.text)]
            self.vless = [f'{i[0]}{i[1]}' for i in re.findall("(vless:\/\/[^\#\s\n]*)(\#[^\s\n<]+)", page.text)]
            self.vmess = [f'{i[0]}{i[1]}' for i in re.findall("(vmess:\/\/[^\#\s\n]*)(\#[^\s\n<]+)", page.text)]
            self.trojan = [f'{i[0]}{i[1]}' for i in re.findall("(trojan:\/\/[^\#\s\n]*)(\#[^\s\n<]+)", page.text)]
