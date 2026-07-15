import requests
import json
from config import Protocols, check_node
import base64
import os
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
                clean_link = link.split("|channel:")[0] if "|channel:" in link else link
                _ = self._vmess_get_host_port(clean_link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.vless = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        ## Vmess
        for link in self.network.vmess:
            try:
                clean_link = link.split("|channel:")[0] if "|channel:" in link else link
                _ = self._vmess_get_host_port(clean_link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.vmess = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        ## ShadowSocks
        for link in self.network.ss:
            try:
                clean_link = link.split("|channel:")[0] if "|channel:" in link else link
                _ = self._outline_get_host_port(clean_link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.ss = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')
                
        ## Trojan
        for link in self.network.trojan:
            try:
                clean_link = link.split("|channel:")[0] if "|channel:" in link else link
                _ = self._trojan_get_host_port(clean_link)
                if _ and _[0] and self._check_access(_[0], _[1]):
                    self.trojan = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {er}')

        print(f'Tested Links: {len(self.vless)+len(self.vmess)+len(self.ss)+len(self.trojan)}')
        print(f'Error Encounter During Test Link: {self.error_count}')


def save(network: Protocols, save_path: str = None) -> bool:
    save_path = save_path if save_path is not None else './hub/'
    
    header = "[ID][COUNTRY][REAL DELAY][TYPE][TEST TYPE][CHANNEL]"

    with open(path.join(save_path, 'ss.txt'), 'w') as fli:
        fli.write(f'{header}\n')
        for link in network.ss:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'vmess.txt'), 'w') as fli:
        fli.write(f'{header}\n')
        for link in network.vmess:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'vless.txt'), 'w') as fli:
        fli.write(f'{header}\n')
        for link in network.vless:
            fli.write(f'{link}\n')
        
    with open(path.join(save_path, 'trojan.txt'), 'w') as fli:
        fli.write(f'{header}\n')
        for link in network.trojan:
            fli.write(f'{link}\n')

    with open(path.join(save_path, 'merged.txt'), 'w') as fli:
        fli.write(f'{header}\n')
        mrg = []
        mrg.extend(network.ss)
        mrg.extend(network.vmess)
        mrg.extend(network.vless)
        mrg.extend(network.trojan)
        for link in mrg:
            fli.write(f'{link}\n')


def save_b64(network: Protocols, save_path: str = None) -> bool:
    save_path = save_path if save_path is not None else './hub/'

    header = "[ID][COUNTRY][REAL DELAY][TYPE][TEST TYPE][CHANNEL]\n"

    ss_b64 = header
    vmess_b64 = header
    vless_b64 = header
    trojan_b64 = header
    
    for link in network.ss:
        ss_b64 += link + '\n'
        
    for link in network.vmess:
        vmess_b64 += link + '\n'

    for link in network.vless:
        vless_b64 += link + '\n'
        
    for link in network.trojan:
        trojan_b64 += link + '\n'

    mrg = header
    for link in network.ss:
        mrg += link + '\n'
    for link in network.vmess:
        mrg += link + '\n'
    for link in network.vless:
        mrg += link + '\n'
    for link in network.trojan:
        mrg += link + '\n'

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


def get_country(network: Protocols, max_workers: int = 50):
    import threading
    import re
    countries = {}
    ip_cache = {}
    cache_lock = threading.Lock()
    countries_lock = threading.Lock()

    def _get_country(ip: str, base_api: str = 'https://ipinfo.io/{ip}/json') -> str:
        try:
            res = requests.get(base_api.replace('{ip}', ip), timeout=3)
            if res.status_code == 200:
                return res.json().get('country')
        except Exception:
            pass
        return None

    def _get_country_cached(ip: str) -> str:
        with cache_lock:
            if ip in ip_cache:
                return ip_cache[ip]
        
        country = _get_country(ip)
        
        with cache_lock:
            ip_cache[ip] = country
        return country

    def _add_to_dict(link: str, country: str):
        with countries_lock:
            if countries.get(country):
                countries[country].append(link)
            else:
                countries[country] = [link]

    def _extract_country_from_link(link: str, link_type: str) -> str:
        remark = ""
        try:
            if link_type == "vmess":
                import base64
                import json
                payload = link[8:]
                missing_padding = len(payload) % 4
                if missing_padding:
                    payload += '=' * (4 - missing_padding)
                decoded = base64.b64decode(payload).decode('utf-8')
                data = json.loads(decoded)
                remark = data.get('ps', '')
            else:
                if '#' in link:
                    remark = link.split('#')[-1]
            
            m = re.match(r'^\[\d+\]\[([A-Z]{2}|UnResolvedDomains)\]', remark)
            if m:
                return m.group(1)
        except Exception:
            pass
        return None

    def _process_link(conf_link: str, get_host_port_fn, link_type: str):
        extracted = _extract_country_from_link(conf_link, link_type)
        if extracted:
            _add_to_dict(conf_link, extracted)
            return

        try:
            host_port = get_host_port_fn(conf_link)
            if host_port and host_port[0]:
                ip = resolve_domain_to_ip(host_port[0])
                if ip:
                    country = _get_country_cached(ip)
                    _add_to_dict(conf_link, country if country else "UnResolvedDomains")
                    return
            _add_to_dict(conf_link, "UnResolvedDomains")
        except Exception as err:
            _add_to_dict(conf_link, "UnResolvedDomains")

    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        if network.ss:
            for conf_link in network.ss:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._outline_get_host_port, "ss"))
        if network.vmess:
            for conf_link in network.vmess:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._vmess_get_host_port, "vmess"))
        if network.vless:
            for conf_link in network.vless:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._outline_get_host_port, "vless"))
        if network.trojan:
            for conf_link in network.trojan:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._trojan_get_host_port, "trojan"))
                
        for f in futures:
            f.result()

    class meta:
        def __init__(self, data: dict):
            self.data = data

        def save(self, save_path: str = './hub/'):
            header = "[ID][COUNTRY][REAL DELAY][TYPE][TEST TYPE][CHANNEL]"
            for _country in self.data.keys():
                with open(path.join(save_path, f'{_country}.txt'), 'w') as fli:
                    fli.write(f'{header}\n\n')
                    for link in self.data.get(_country):
                        fli.write(f'{link}\n\n')

        def print(self):
            """print all countries code"""
            return list(self.data.keys())

        def count(self):
            return len(self.data.keys())

    return meta(countries)


class CheckSelf(Protocols):
    def __init__(self, network: Protocols, max_workers: int = 50):
        Protocols.__init__(self)
        self.error_count = 0
        self.network = network
        self.max_workers = max_workers
        self.delays = {}
        self._check_links()

    @staticmethod
    def find_free_port():
        s = socket.socket()
        s.bind(('', 0))
        port = s.getsockname()[1]
        s.close()
        return port

    @staticmethod
    def parse_ss_to_outbound(link: str) -> dict:
        payload = link[5:]
        if '#' in payload:
            payload = payload.split('#')[0]
        if '?' in payload:
            payload = payload.split('?')[0]
            
        method = ""
        password = ""
        host = ""
        port = 8388
        
        if '@' in payload:
            parts = payload.split('@')
            userinfo_b64 = parts[0]
            host_port = parts[1]
            
            try:
                missing_padding = len(userinfo_b64) % 4
                if missing_padding:
                    userinfo_b64 += '=' * (4 - missing_padding)
                decoded_userinfo = base64.b64decode(userinfo_b64).decode('utf-8')
                if ':' in decoded_userinfo:
                    method, password = decoded_userinfo.split(':', 1)
            except Exception:
                pass
                
            if ':' in host_port:
                host, port_str = host_port.split(':')
                port = int(port_str)
            else:
                host = host_port
        else:
            try:
                missing_padding = len(payload) % 4
                if missing_padding:
                    payload += '=' * (4 - missing_padding)
                decoded = base64.b64decode(payload).decode('utf-8', errors='ignore')
                if '@' in decoded:
                    userinfo, host_port = decoded.split('@', 1)
                    if ':' in userinfo:
                        method, password = userinfo.split(':', 1)
                    if ':' in host_port:
                        host, port_str = host_port.split(':')
                        port = int(port_str)
                    else:
                        host = host_port
            except Exception:
                pass
                
        return {
            "protocol": "shadowsocks",
            "settings": {
                "servers": [
                    {
                        "address": host,
                        "port": port,
                        "method": method,
                        "password": password
                    }
                ]
            }
        }

    @staticmethod
    def parse_trojan_to_outbound(link: str) -> dict:
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(link)
        password = parsed.username or ""
        host = parsed.hostname or ""
        port = parsed.port or 443
        
        query_params = parse_qs(parsed.query)
        sni = query_params.get('sni', [host])[0]
        network = query_params.get('type', ['tcp'])[0]
        path = query_params.get('path', [''])[0]
        
        stream_settings = {
            "network": network,
            "security": "tls",
            "tlsSettings": {
                "serverName": sni
            }
        }
        
        if network == "ws":
            stream_settings["wsSettings"] = {
                "path": path,
                "headers": {
                    "Host": sni
                }
            }
        elif network == "grpc":
            service_name = query_params.get('serviceName', [''])[0]
            stream_settings["grpcSettings"] = {
                "serviceName": service_name
            }
            
        return {
            "protocol": "trojan",
            "settings": {
                "servers": [
                    {
                        "address": host,
                        "port": port,
                        "password": password
                    }
                ]
            },
            "streamSettings": stream_settings
        }

    @staticmethod
    def parse_vmess_to_outbound(link: str) -> dict:
        payload = link[8:]
        missing_padding = len(payload) % 4
        if missing_padding:
            payload += '=' * (4 - missing_padding)
        decoded = base64.b64decode(payload).decode('utf-8')
        data = json.loads(decoded)
        
        host = data.get('add', '')
        port = int(data.get('port', 443))
        uuid = data.get('id', '')
        alter_id = int(data.get('aid', 0))
        security = data.get('scy', 'auto')
        
        network = data.get('net', 'tcp')
        path = data.get('path', '')
        host_header = data.get('host', '')
        tls = data.get('tls', '')
        sni = data.get('sni', host_header if host_header else host)
        
        stream_settings = {
            "network": network
        }
        
        if tls == "tls":
            stream_settings["security"] = "tls"
            stream_settings["tlsSettings"] = {
                "serverName": sni
            }
            
        if network == "ws":
            stream_settings["wsSettings"] = {
                "path": path,
                "headers": {
                    "Host": host_header if host_header else sni
                }
            }
        elif network == "grpc":
            stream_settings["grpcSettings"] = {
                "serviceName": path
            }
            
        return {
            "protocol": "vmess",
            "settings": {
                "vnext": [
                    {
                        "address": host,
                        "port": port,
                        "users": [
                            {
                                "id": uuid,
                                "alterId": alter_id,
                                "security": security
                            }
                        ]
                    }
                ]
            },
            "streamSettings": stream_settings
        }

    @staticmethod
    def parse_vless_to_outbound(link: str) -> dict:
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(link)
        uuid = parsed.username or ""
        host = parsed.hostname or ""
        port = parsed.port or 443
        
        query_params = parse_qs(parsed.query)
        security = query_params.get('security', ['none'])[0]
        sni = query_params.get('sni', [host])[0]
        network = query_params.get('type', ['tcp'])[0]
        path = query_params.get('path', [''])[0]
        flow = query_params.get('flow', [''])[0]
        
        stream_settings = {
            "network": network
        }
        
        if security == "tls":
            stream_settings["security"] = "tls"
            stream_settings["tlsSettings"] = {
                "serverName": sni
            }
        elif security == "reality":
            stream_settings["security"] = "reality"
            pbk = query_params.get('pbk', [''])[0]
            sid = query_params.get('sid', [''])[0]
            stream_settings["realitySettings"] = {
                "serverName": sni,
                "publicKey": pbk,
                "shortId": sid,
                "fingerprint": query_params.get('fp', ['chrome'])[0]
            }
            
        if network == "ws":
            host_header = query_params.get('host', [sni])[0]
            stream_settings["wsSettings"] = {
                "path": path,
                "headers": {
                    "Host": host_header
                }
            }
        elif network == "grpc":
            service_name = query_params.get('serviceName', [''])[0]
            stream_settings["grpcSettings"] = {
                "serviceName": service_name
            }
            
        user_obj = {
            "id": uuid,
            "encryption": "none"
        }
        if flow:
            user_obj["flow"] = flow
            
        return {
            "protocol": "vless",
            "settings": {
                "vnext": [
                    {
                        "address": host,
                        "port": port,
                        "users": [user_obj]
                    }
                ]
            },
            "streamSettings": stream_settings
        }

    @staticmethod
    def link_to_xray_config(link: str, local_port: int) -> dict:
        outbound = None
        if link.startswith('ss://'):
            outbound = CheckSelf.parse_ss_to_outbound(link)
        elif link.startswith('vmess://'):
            outbound = CheckSelf.parse_vmess_to_outbound(link)
        elif link.startswith('vless://'):
            outbound = CheckSelf.parse_vless_to_outbound(link)
        elif link.startswith('trojan://'):
            outbound = CheckSelf.parse_trojan_to_outbound(link)
            
        if not outbound:
            return None
            
        return {
            "log": {
                "loglevel": "none"
            },
            "inbounds": [
                {
                    "port": local_port,
                    "listen": "127.0.0.1",
                    "protocol": "http",
                    "settings": {
                        "timeout": 10
                    }
                }
            ],
            "outbounds": [
                outbound
            ]
        }

    @staticmethod
    def xray_test(link: str, xray_path: str = "./xray", timeout: float = 5.0) -> float:
        import subprocess
        import time
        
        port = CheckSelf.find_free_port()
        config = CheckSelf.link_to_xray_config(link, port)
        if not config:
            return None
            
        config_file = f"config_temp_{port}.json"
        with open(config_file, "w") as f:
            json.dump(config, f)
            
        try:
            proc = subprocess.Popen(
                [xray_path, "-config", config_file],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            time.sleep(0.3)
            
            proxies = {
                "http": f"http://127.0.0.1:{port}",
                "https": f"http://127.0.0.1:{port}"
            }
            
            start_time = time.time()
            try:
                response = requests.get(
                    "http://cp.cloudflare.com/generate_204",
                    proxies=proxies,
                    timeout=timeout
                )
                if response.status_code == 204:
                    delay = (time.time() - start_time) * 1000
                    return delay
            except Exception:
                pass
        finally:
            try:
                proc.terminate()
                proc.wait(timeout=1.0)
            except Exception:
                pass
            if os.path.exists(config_file):
                os.remove(config_file)
                
        return None

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

    def _check_link(self, link_type: str, link: str, use_xray: bool):
        clean_link = link.split("|channel:")[0] if "|channel:" in link else link
        try:
            if use_xray:
                delay = self.xray_test(clean_link)
                if delay is not None:
                    print(f"{link_type.upper()} OK: {clean_link} > delay: {delay:.1f}ms")
                    with self.lock:
                        self.delays[link] = int(round(delay))
                        if link_type == "vless":
                            self.vless = link
                        elif link_type == "vmess":
                            self.vmess = link
                        elif link_type == "ss":
                            self.ss = link
                        elif link_type == "trojan":
                            self.trojan = link
            else:
                _ = None
                if link_type == "vless" or link_type == "vmess":
                    _ = CheckHost._vmess_get_host_port(clean_link)
                elif link_type == "ss":
                    _ = CheckHost._outline_get_host_port(clean_link)
                elif link_type == "trojan":
                    _ = CheckHost._trojan_get_host_port(clean_link)
                    
                if _ and _[0] and self.tcp_test(_[0], _[1]):
                    with self.lock:
                        if link_type == "vless":
                            self.vless = link
                        elif link_type == "vmess":
                            self.vmess = link
                        elif link_type == "ss":
                            self.ss = link
                        elif link_type == "trojan":
                            self.trojan = link
        except Exception:
            with self.lock:
                self.error_count += 1

    def _check_links(self):
        use_xray = os.path.exists("./xray")
        if not use_xray:
            print("# Warning: './xray' binary not found. Falling back to TCP handshake test.")

        import threading
        self.lock = threading.Lock()

        from concurrent.futures import ThreadPoolExecutor
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = []
            for link in self.network.vless:
                futures.append(executor.submit(self._check_link, "vless", link, use_xray))
            for link in self.network.vmess:
                futures.append(executor.submit(self._check_link, "vmess", link, use_xray))
            for link in self.network.ss:
                futures.append(executor.submit(self._check_link, "ss", link, use_xray))
            for link in self.network.trojan:
                futures.append(executor.submit(self._check_link, "trojan", link, use_xray))
                
            for f in futures:
                f.result()

        print(f'Tested Links: {len(self.vless) + len(self.vmess) + len(self.ss) + len(self.trojan)}')
        print(f'Error Encounter During Test Link: {self.error_count}')


def standardize_network(network: Protocols, test_type: str, max_workers: int = 50):
    import base64
    import json
    import threading
    from concurrent.futures import ThreadPoolExecutor

    ip_cache = {}
    cache_lock = threading.Lock()

    def _get_country(ip: str, base_api: str = 'https://ipinfo.io/{ip}/json') -> str:
        try:
            res = requests.get(base_api.replace('{ip}', ip), timeout=3)
            if res.status_code == 200:
                return res.json().get('country')
        except Exception:
            pass
        return None

    def _get_country_cached(ip: str) -> str:
        with cache_lock:
            if ip in ip_cache:
                return ip_cache[ip]
        country = _get_country(ip)
        with cache_lock:
            ip_cache[ip] = country
        return country

    link_countries = {}
    lock = threading.Lock()

    def _process_link(conf_link: str, get_host_port_fn):
        clean_link = conf_link.split("|channel:")[0] if "|channel:" in conf_link else conf_link
        try:
            host_port = get_host_port_fn(clean_link)
            if host_port and host_port[0]:
                ip = resolve_domain_to_ip(host_port[0])
                if ip:
                    c = _get_country_cached(ip)
                    if c:
                        with lock:
                            link_countries[conf_link] = c
                        return
            with lock:
                link_countries[conf_link] = "UnResolvedDomains"
        except Exception:
            with lock:
                link_countries[conf_link] = "UnResolvedDomains"

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        if network.ss:
            for conf_link in network.ss:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._outline_get_host_port))
        if network.vmess:
            for conf_link in network.vmess:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._vmess_get_host_port))
        if network.vless:
            for conf_link in network.vless:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._outline_get_host_port))
        if network.trojan:
            for conf_link in network.trojan:
                futures.append(executor.submit(_process_link, conf_link, CheckHost._trojan_get_host_port))
                
        for f in futures:
            f.result()

    def format_ss_vless_trojan(link: str, title: str) -> str:
        if '#' in link:
            base = link.split('#')[0]
        else:
            base = link
        return f"{base}#{title}"

    def format_vmess(link: str, title: str) -> str:
        try:
            payload = link[8:]
            missing_padding = len(payload) % 4
            if missing_padding:
                payload += '=' * (4 - missing_padding)
            decoded = base64.b64decode(payload).decode('utf-8')
            data = json.loads(decoded)
            data['ps'] = title
            new_payload = base64.b64encode(json.dumps(data).encode('utf-8')).decode('utf-8')
            return f"vmess://{new_payload}"
        except Exception:
            return link

    delays = getattr(network, 'delays', {})

    new_ss = []
    for i, link in enumerate(sorted(network.ss), 1):
        channel_name = "None"
        clean_link = link
        if "|channel:" in link:
            parts = link.split("|channel:")
            clean_link = parts[0]
            channel_name = parts[1]
        country = link_countries.get(link, "UnResolvedDomains")
        delay_val = delays.get(link, 0)
        title = f"[{i}][{country}][{delay_val}][SS][{test_type}][{channel_name}]"
        new_ss.append(format_ss_vless_trojan(clean_link, title))
    network._Protocols__ss = set(new_ss)

    new_vmess = []
    for i, link in enumerate(sorted(network.vmess), 1):
        channel_name = "None"
        clean_link = link
        if "|channel:" in link:
            parts = link.split("|channel:")
            clean_link = parts[0]
            channel_name = parts[1]
        country = link_countries.get(link, "UnResolvedDomains")
        delay_val = delays.get(link, 0)
        title = f"[{i}][{country}][{delay_val}][VMESS][{test_type}][{channel_name}]"
        new_vmess.append(format_vmess(clean_link, title))
    network._Protocols__vmess = set(new_vmess)

    new_vless = []
    for i, link in enumerate(sorted(network.vless), 1):
        channel_name = "None"
        clean_link = link
        if "|channel:" in link:
            parts = link.split("|channel:")
            clean_link = parts[0]
            channel_name = parts[1]
        country = link_countries.get(link, "UnResolvedDomains")
        delay_val = delays.get(link, 0)
        title = f"[{i}][{country}][{delay_val}][VLESS][{test_type}][{channel_name}]"
        new_vless.append(format_ss_vless_trojan(clean_link, title))
    network._Protocols__vless = set(new_vless)

    new_trojan = []
    for i, link in enumerate(sorted(network.trojan), 1):
        channel_name = "None"
        clean_link = link
        if "|channel:" in link:
            parts = link.split("|channel:")
            clean_link = parts[0]
            channel_name = parts[1]
        country = link_countries.get(link, "UnResolvedDomains")
        delay_val = delays.get(link, 0)
        title = f"[{i}][{country}][{delay_val}][TROJAN][{test_type}][{channel_name}]"
        new_trojan.append(format_ss_vless_trojan(clean_link, title))
    network._Protocols__trojan = set(new_trojan)

