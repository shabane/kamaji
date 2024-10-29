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
                self.__ss.add(ss_link.strip())
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__ss.add(link.strip())
    
    @property        
    def vmess(self):
        return self.__vmess
        
    @vmess.setter
    def vmess(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vmess.add(ss_link.strip())
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vmess.add(link.strip())

        
    @property        
    def vless(self):
        return self.__vless
        
    @vless.setter
    def vless(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vless.add(ss_link.strip())
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vless.add(link.strip())
    
    @property        
    def trojan(self):
        return self.__trojan
        
    @trojan.setter
    def trojan(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__trojan.add(ss_link.strip())
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__trojan.add(link.strip())


channels = open('channels.lst', 'r')
channels = [i.strip() for i in channels.readlines() if i != '\n']
check_node = 'https://reverent-khayyam-zlyspjbuw.liara.run/api/tcp/'
