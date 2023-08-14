#!/usr/bin/env python3
import config
from telegram import Telegram


if __name__ == '__main__':
    network01 = Telegram(channels=config.channels)
    print(f'shadow socks: {len(network01.ss)}')
    print(f'vmess: {len(network01.vmess)}')
    print(f'vless: {len(network01.vless)}')
    print(f'trojan: {len(network01.trojan)}')
    config.save(network01)
