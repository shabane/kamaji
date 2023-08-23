#!/usr/bin/env python3
import config
from telegram import Telegram
from tools import CheckHost
import tools


if __name__ == '__main__':
    network01 = Telegram(channels=config.channels)
    print(f'shadow socks: {len(network01.ss)}')
    print(f'vmess: {len(network01.vmess)}')
    print(f'vless: {len(network01.vless)}')
    print(f'trojan: {len(network01.trojan)}')
    tools.save(network01)
    
    ch_network01 = CheckHost(network01)
    print(f'shadow socks: {len(ch_network01.ss)}')
    print(f'vmess: {len(ch_network01.vmess)}')
    print(f'vless: {len(ch_network01.vless)}')
    print(f'trojan: {len(ch_network01.trojan)}')
    tools.save(ch_network01, './hub/tested/')
