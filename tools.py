import requests
import json
from config import Protocols, check_node
import base64
from os import path
import socket
from urllib.parse import urlparse


class CheckHost(Protocols):
    def __init__(self, network: Protocols) -> None:
        self.network = network
        self.error_count = 0
        Protocols.__init__(self)
        self._check_links()

    @staticmethod
    def remove_combined_strings(text: str):
        if isinstance(text, int):
            return str(text)
        res = []
        for char in str(text):
            if char.isdigit():
                res.append(char)
            else:
                break
        return "".join(res) if res else str(text)

    @staticmethod
    def _is_b64(data: str) -> bool:
        try:
            missing_padding = len(data) % 4
            if missing_padding:
                data += '=' * (4 - missing_padding)
            base64.b64decode(data).decode('utf-8')
            return True
        except Exception:
            return False

    @staticmethod
    def get_host_port(link: str) -> tuple:
        if not link:
            return (None, None)
        if link.startswith('vmess://'):
            # VMess might be base64 JSON
            payload = link[8:]
            if CheckHost._is_b64(payload):
                try:
                    missing_padding = len(payload) % 4
                    if missing_padding:
                        payload += '=' * (4 - missing_padding)
                    decoded = base64.b64decode(payload).decode('utf-8')
                    link_json = json.loads(decoded)
                    return (link_json.get('add'), link_json.get('port'))
                except Exception:
                    pass
        elif link.startswith('ss://'):
            # Shadowsocks
            try:
                payload = link[5:]
                if '#' in payload:
                    payload = payload.split('#')[0]
                if '?' in payload:
                    payload = payload.split('?')[0]
                if '@' not in payload:
                    try:
                        missing_padding = len(payload) % 4
                        if missing_padding:
                            padded_payload = payload + '=' * (4 - missing_padding)
                        else:
                            padded_payload = payload
                        decoded = base64.b64decode(padded_payload).decode('utf-8', errors='ignore')
                        if '@' in decoded:
                            payload = decoded
                    except Exception:
                        pass
                if '@' in payload:
                    parts = payload.split('@')
                    host_port = parts[1]
                else:
                    host_port = payload
                if ':' in host_port:
                    host, port = host_port.split(':')
                    return (host, int(port))
                else:
                    return (host_port, 8388)
            except Exception:
                return (None, None)

        # General URL parsing (for Vless, Trojan, and standard VMess/SS)
        try:
            parsed = urlparse(link)
            return (parsed.hostname, parsed.port or 443)
        except Exception:
            return (None, None)

    @staticmethod
    def _vmess_get_host_port(link: str) -> tuple:
        return CheckHost.get_host_port(link)

    @staticmethod  
    def _outline_get_host_port(link: str) -> tuple:
        return CheckHost.get_host_port(link)

    @staticmethod
    def _trojan_get_host_port(link: str) -> tuple:
        return CheckHost.get_host_port(link)

    @staticmethod
    def _check_access(host: str, port: int = 443):
        if not host:
            return False
        headers = {
            'Accept': 'application/json',
        }

        try:
            response = requests.get(f'{check_node}?host={host}&port={port}&timeout=1', headers=headers)
            if response.status_code == 200:
                return response.json()['result']['ok']
        except Exception:
            pass
        return False

    def _check_links(self):
        ## Vless
        for link in self.network.vless:
            try:
                _ = self._vmess_get_host_port(link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.vless = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        ## Vmess
        for link in self.network.vmess:
            try:
                _ = self._vmess_get_host_port(link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.vmess = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        ## ShadowSocks
        for link in self.network.ss:
            try:
                _ = self._outline_get_host_port(link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.ss = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')
                
        ## Trojan
        for link in self.network.trojan:
            try:
                _ = self._trojan_get_host_port(link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.trojan = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        print(f'Tested Links: {len(self.vless)+len(self.vmess)+len(self.ss)+len(self.trojan)}')
        print(f'Error Encounter During Test Link: {self.error_count}')


def save(network: Protocols, save_path: str = None) -> bool:
    save_path = save_path if save_path is not None else './hub/'
    
    with open(path.join(save_path, 'ss.txt'), 'w') as fli:
        for link in network.ss:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'vmess.txt'), 'w') as fli:
        for link in network.vmess:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'vless.txt'), 'w') as fli:
        for link in network.vless:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'trojan.txt'), 'w') as fli:
        for link in network.trojan:
            fli.write(f'{link}\n')

    with open(path.join(save_path, 'merged.txt'), 'w') as fli:
        mrg = []
        mrg.extend(network.ss)
        mrg.extend(network.vmess)
        mrg.extend(network.vless)
        mrg.extend(network.trojan)
        for link in mrg:
            fli.write(f'{link}\n')


def save_b64(network: Protocols, save_path: str = None) -> bool:
    save_path = save_path if save_path is not None else './hub/'

    ss_b64 = ''
    vmess_b64 = ''
    vless_b64 = ''
    trojan_b64 = ''
    mrg = ''
    
    for link in network.ss:
        ss_b64 += link + '\n'
        
    for link in network.vmess:
        vmess_b64 += link + '\n'

    for link in network.vless:
        vless_b64 += link + '\n'
        
    for link in network.trojan:
        trojan_b64 += link + '\n'

    mrg = ss_b64 + vmess_b64 + vless_b64 + trojan_b64

    with open(path.join(save_path, 'ss.txt'), 'w') as fli:
        ss_b64 = base64.b64encode(bytes(ss_b64, 'utf-8')).decode()
        fli.write(ss_b64)
        
    with open(path.join(save_path, 'vmess.txt'), 'w') as fli:
        vmess_b64 = base64.b64encode(bytes(vmess_b64, 'utf-8')).decode()
        fli.write(vmess_b64)
        
    with open(path.join(save_path, 'vless.txt'), 'w') as fli:
        vless_b64 = base64.b64encode(bytes(vless_b64, 'utf-8')).decode()
        fli.write(vless_b64)
        
    with open(path.join(save_path, 'trojan.txt'), 'w') as fli:
        trojan_b64 = base64.b64encode(bytes(trojan_b64, 'utf-8')).decode()
        fli.write(trojan_b64)

    with open(path.join(save_path, 'merged.txt'), 'w') as fli:
        mrg = base64.b64encode(bytes(mrg, 'utf-8')).decode()
        fli.write(mrg)


def resolve_domain_to_ip(domain: str):
  try:
    ip_address = socket.gethostbyname(domain)
    return ip_address
  except:
    print(f"# Error resolving {domain}")
    return None


def get_country(network: Protocols):
    countries = {
        # "COUNTRY-CODE": [],
    }

    def _get_country(ip: str, base_api: str = 'https://ipinfo.io/{ip}/json') -> str:
        try:
            res = requests.get(base_api.replace('{ip}', ip), timeout=3)
            if res.status_code == 200:
                return res.json().get('country')
        except Exception:
            pass
        return None

    def _add_to_dict(link: str, country: str):
        if countries.get(country):
            countries[country].append(link)
        else:
            countries[country] = [link]

    # ss
    if network.ss:
        for conf_link in network.ss:
            try:
                ip = resolve_domain_to_ip(CheckHost._outline_get_host_port(conf_link)[0])
                if ip:
                    country = _get_country(ip)
                    _add_to_dict(conf_link, country if country else "UnResolvedDomains")
                else:
                    _add_to_dict(conf_link, "UnResolvedDomains")
            except Exception as err:
                print(f"# {err}")
                _add_to_dict(conf_link, "UnResolvedDomains")

    # vmess
    if network.vmess:
        for conf_link in network.vmess:
            try:
                ip = resolve_domain_to_ip(CheckHost._vmess_get_host_port(conf_link)[0])
                if ip:
                    country = _get_country(ip)
                    _add_to_dict(conf_link, country if country else "UnResolvedDomains")
                else:
                    _add_to_dict(conf_link, "UnResolvedDomains")
            except Exception as err:
                print(f"# {err}")
                _add_to_dict(conf_link, "UnResolvedDomains")

    # vless
    if network.vless:
        for conf_link in network.vless:
            try:
                ip = resolve_domain_to_ip(CheckHost._outline_get_host_port(conf_link)[0])
                if ip:
                    country = _get_country(ip)
                    _add_to_dict(conf_link, country if country else "UnResolvedDomains")
                else:
                    _add_to_dict(conf_link, "UnResolvedDomains")
            except Exception as err:
                print(f"# {err}")
                _add_to_dict(conf_link, "UnResolvedDomains")

    # trojan
    if network.trojan:
        for conf_link in network.trojan:
            try:
                ip = resolve_domain_to_ip(CheckHost._trojan_get_host_port(conf_link)[0])
                if ip:
                    country = _get_country(ip)
                    _add_to_dict(conf_link, country if country else "UnResolvedDomains")
                else:
                    _add_to_dict(conf_link, "UnResolvedDomains")
            except Exception as err:
                print(f"# {err}")
                _add_to_dict(conf_link, "UnResolvedDomains")

    class meta:
        def __init__(self, data: dict):
            self.data = data

        def save(self, save_path: str = './hub/'):
            for _country in self.data.keys():
                with open(path.join(save_path, f'{_country}.txt'), 'w') as fli:
                    for link in self.data.get(_country):
                        fli.write(f'{link}\n\n')

        def print(self):
            """print all countries code"""
            return list(self.data.keys())

        def count(self):
            return len(self.data.keys())

    return meta(countries)


class CheckSelf(Protocols):
    def __init__(self, network: Protocols):
        Protocols.__init__(self)
        self.error_count = 0
        self.network = network
        self._check_links()

    @staticmethod
    def tcp_test(ip: str, port: str, timeout: int = 2.5):
        if not ip or not port:
            return False
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            port = int(CheckHost.remove_combined_strings(port))
            result = sock.connect_ex((ip, port))
            if result == 0:
                return True
            else:
                return False
        except Exception as err:
            print(f"# Error on TCP test [{ip}:{port}] -> {err}")
            return False

    def _check_links(self):
        # vless
        for link in self.network.vless:
            try:
                _ = CheckHost._vmess_get_host_port(link)
                if _ and _[0] and self.tcp_test(_[0], _[1]):
                    self.vless = link
            except Exception as err:
                self.error_count += 1
                print(f'# Check Error -> {link} > {err}')

        # vmess
        for link in self.network.vmess:
            try:
                _ = CheckHost._vmess_get_host_port(link)
                if _ and _[0] and self.tcp_test(_[0], _[1]):
                    self.vmess = link
            except Exception as err:
                self.error_count += 1
                print(f'# Check Error -> {link} > {err}')

        # ShadowSocks
        for link in self.network.ss:
            try:
                _ = CheckHost._outline_get_host_port(link)
                if _ and _[0] and self.tcp_test(_[0], _[1]):
                    self.ss = link
            except Exception as err:
                self.error_count += 1
                print(f'# Check Error -> {link} > {err}')

        # Trojan
        for link in self.network.trojan:
            try:
                _ = CheckHost._trojan_get_host_port(link)
                if _ and _[0] and self.tcp_test(_[0], _[1]):
                    self.trojan = link
            except Exception as err:
                self.error_count += 1
                print(f'# Check Error -> {link} > {err}')

        print(f'Tested Links: {len(self.vless) + len(self.vmess) + len(self.ss) + len(self.trojan)}')
        print(f'Error Encounter During Test Link: {self.error_count}')
