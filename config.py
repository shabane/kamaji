from os import path

class Protocols:
    def __init__(self) -> None:
        self.__ss = set()
        self.__vmess = set()
        self.__vless = set()
        self.__trojan = set()
        
    @property        
    def ss(self):
        return self.__ss
        
    @ss.setter
    def ss(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__ss.add(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__ss.add(link)
    
    @property        
    def vmess(self):
        return self.__vmess
        
    @vmess.setter
    def vmess(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vmess.add(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vmess.add(link)

        
    @property        
    def vless(self):
        return self.__vless
        
    @vless.setter
    def vless(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vless.add(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vless.add(link)
    
    @property        
    def trojan(self):
        return self.__trojan
        
    @trojan.setter
    def trojan(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__trojan.add(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__trojan.add(link)


channels = open('channels.lst', 'r')
channels = [i.strip() for i in channels.readlines() if i != '\n']


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
