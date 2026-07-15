#!/usr/bin/env python3
import config
from telegram import Telegram
from tools import CheckHost, CheckSelf
import tools
import argparse
import sys


if __name__ == '__main__':

    cmd = argparse.ArgumentParser()
    cmd.add_argument("--check", help="check all configs if working", action="store_true")
    cmd.add_argument("--save", help="save configs to its files [default action]", action="store_true", default=True)
    cmd.add_argument("--print", help="get all configs and prints to stdout[no save!]", action="store_true")
    cmd.add_argument("--country", help="distinguish configs by countries IP", action="store_true")
    cmd.add_argument("--self-check", help="check all config connections locally using xray prober (delay test)", action="store_true")
    cmd.add_argument("--max-page", help="maximum pages to scrape per channel", type=int, default=5)
    cmd.add_argument("--max-thread", help="maximum concurrent threads to use", type=int, default=50)
    flags = cmd.parse_args()

    network01 = Telegram(channels=config.channels, max_pages=flags.max_page, max_workers=flags.max_thread)
    print(f'# shadow socks: {len(network01.ss)}')
    print(f'# vmess: {len(network01.vmess)}')
    print(f'# vless: {len(network01.vless)}')
    print(f'# trojan: {len(network01.trojan)}')
    tools.standardize_network(network01, "None", max_workers=flags.max_thread)
    tools.save(network01) if flags.save else ...
    tools.save_b64(network01, './hub/b64/') if flags.save else ...

    if flags.print:
        print("# Untested Results:")

        for ss_link in network01.ss:
            print(ss_link)

        for vmess_link in network01.vmess:
            print(vmess_link)

        for vless_link in network01.vless:
            print(vless_link)

        for trj_link in network01.trojan:
            print(trj_link)

    if flags.country:
        country = tools.get_country(network01, max_workers=flags.max_thread)
        print(f'# Found {country.count()} Countries.')
        print(f'# {country.print()}')
        country.save() if flags.save else ...

    if flags.check:
        ch_network01 = CheckHost(network01)
        print(f'# shadow socks: {len(ch_network01.ss)}')
        print(f'# vmess: {len(ch_network01.vmess)}')
        print(f'# vless: {len(ch_network01.vless)}')
        print(f'# trojan: {len(ch_network01.trojan)}')
        tools.standardize_network(ch_network01, "API", max_workers=flags.max_thread)
        tools.save(ch_network01, './hub/tested/') if flags.save else ...
        tools.save_b64(ch_network01, './hub/tested/b64') if flags.save else ...

        if flags.print:
            print("# tested Results:")

            for ss_link in ch_network01.ss:
                print(ss_link)

            for vmess_link in ch_network01.vmess:
                print(vmess_link)

            for vless_link in ch_network01.vless:
                print(vless_link)

            for trj_link in ch_network01.trojan:
                print(trj_link)

        if flags.country:
            ch_country = tools.get_country(ch_network01, max_workers=flags.max_thread)
            print(f'# Found & Check {ch_country.count()} Countries.')
            print(f'# {ch_country.print()}')
            ch_country.save('./hub/tested/') if flags.save else ...

    if flags.self_check:
        sch_network01 = CheckSelf(network01, max_workers=flags.max_thread)
        print(f'# shadow socks: {len(sch_network01.ss)}')
        print(f'# vmess: {len(sch_network01.vmess)}')
        print(f'# vless: {len(sch_network01.vless)}')
        print(f'# trojan: {len(sch_network01.trojan)}')
        tools.standardize_network(sch_network01, "GH Action", max_workers=flags.max_thread)
        tools.save(sch_network01, './hub/self/tested/') if flags.save else ...
        tools.save_b64(sch_network01, './hub/self/tested/b64') if flags.save else ...

        if flags.print:
            print("# tested Results:")

            for ss_link in sch_network01.ss:
                print(ss_link)

            for vmess_link in sch_network01.vmess:
                print(vmess_link)

            for vless_link in sch_network01.vless:
                print(vless_link)

            for trj_link in sch_network01.trojan:
                print(trj_link)

        if flags.country:
            sch_country = tools.get_country(sch_network01, max_workers=flags.max_thread)
            print(f'# Found & Check {sch_country.count()} Countries.')
            print(f'# {sch_country.print()}')
            sch_country.save('./hub/self/tested/') if flags.save else ...