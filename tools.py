import requests
import json
from config import Protocols, check_node
import base64
from os import path

class CheckHost(Protocols):
    def __init__(self, network: Protocols) -> None:
        self.network = network
        self.error_count = 0
        Protocols.__init__(self)
        self.__check_links()
    
    @staticmethod
    def __is_b64(data: str) -> bool:
        try:
            decoded = base64.b64decode(data).decode()
            return True
        except Exception:
            return False
    
    def __vmess_get_host_port(self, link: str) -> tuple:
        if self.__is_b64(link[8:]):
            link = base64.b64decode(link)
            link = json.loads(link)
            return (link.get('add'), link.get('port'))
        return tuple(link[link.find('@')+1:link.find('?')].split(':'))

    @staticmethod  
    def __outline_get_host_port(link: str) -> tuple:
        try:
            return tuple(link.split('@')[1].split('/')[0].split(':'))
        except:
            print(f'Error to get host and port for outline {link}')
    
    @staticmethod
    def __check_access(host: str, port:int = 443):
        headers = {
            'Accept': 'application/json',
        }

        response = requests.get(f'{check_node}?host={host}&port={port}&timeout=1', headers=headers)
        
        if response.status_code == 200:
            return response.json()['result']['ok']
        return False

    @staticmethod
    def __trojan_get_host_port(link: str):
        return tuple(link[link.find('@')+1:link.find('?')].split(':'))

    def __check_links(self):
        ## Vless
        for link in self.network.vless:
            try:
                _ = self.__vmess_get_host_port(link)
                if self.__check_access(_[0], _[1]):
                    self.vless = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {_}')

        ## Vmess
        for link in self.network.vmess:
            try:
                _ = self.__vmess_get_host_port(link)
                if self.__check_access(_[0], _[1]):
                    self.vmess = link
            except Exception as er:
                self.error_count += 1
                print(f'Check Error: {link} > {_}')

        ## ShadowSocks
        for link in self.network.ss:
            try:
                _ = self.__outline_get_host_port(link)
                if self.__check_access(_[0], _[1]):
                    self.ss = link
            except:
                self.error_count += 1
                print(f'Check Error: {link} > {_}')
                
        ## Trojan
        for link in self.network.trojan:
            try:
                _ = self.__trojan_get_host_port(link)
                if self.__check_access(_[0], _[1]):
                    self.trojan = link
            except:
                self.error_count += 1
                print(f'Check Error: {link} > {_}')

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
