import requests
import json
from config import Protocols
import base64


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

        response = requests.get(f'https://hostcheck-shabane.apps.ir-thr-ba1.arvanpaas.ir/api/tcp?host={host}&port={port}&timeout=1', headers=headers)
        
        if response.status_code == 200:
            return response.json()['result']['ok']
        return False

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
        
        for link in self.network.ss:
            try:
                _ = self.__outline_get_host_port(link)
                if self.__check_access(_[0], _[1]):
                    self.ss = link
            except:
                self.error_count += 1
                print(f'Check Error: {link} > {_}')

        print(f'Tested Links: {len(self.vless)+len(self.vmess)+len(self.ss)+len(self.trojan)}')
        print(f'Error Encounter During Test Link: {self.error_count}')
