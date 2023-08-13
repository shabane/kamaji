class Protocols:
    def __init__(self) -> None:
        self.__ss = []
        self.__vmess = []
        self.__vless = []
        self.__trojan = []
        
    @property        
    def ss(self):
        return self.__ss
        
    @ss.setter
    def ss(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__ss.append(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__ss.append(link)
    
    @property        
    def vmess(self):
        return self.__vmess
        
    @vmess.setter
    def ss(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vmess.append(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vmess.append(link)

        
    @property        
    def vless(self):
        return self.__vless
        
    @vless.setter
    def vless(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__vless.append(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__vless.append(link)
    
    @property        
    def trojan(self):
        return self.__trojan
        
    @trojan.setter
    def ss(self, ss_link):
        if ss_link:
            if type(ss_link) == str:
                self.__trojan.append(ss_link)
            elif type(ss_link) == list:
                for link in ss_link:
                    self.__trojan.append(link)


channels = open('channels.lst', 'r')
channels = [i.strip() for i in channels.readlines() if i != '\n']
    