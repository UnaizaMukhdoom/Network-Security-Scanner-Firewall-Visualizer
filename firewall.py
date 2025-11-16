from typing import Optional, List
from pydantic import BaseModel

class Rule(BaseModel):
    id: Optional[int] = None
    action: str  # 'allow' or 'deny'
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = 'tcp'
    priority: Optional[int] = 100


class Firewall:
    def __init__(self):
        self.rules: List[Rule] = []

    def add_rule(self, rule: Rule):
        # insert respecting priority (lower number = higher priority)
        self.rules.append(rule)
        self.rules.sort(key=lambda r: (r.priority if r.priority is not None else 100, r.id if r.id is not None else 0))

    def evaluate_single(self, src_ip: Optional[str], dst_ip: Optional[str], port: Optional[int], protocol: Optional[str] = 'tcp') -> bool:
        """Return True if traffic is allowed, False if denied. Default policy: deny if any matching deny, else allow if any matching allow, else deny."""
        for r in self.rules:
            if r.src_ip and r.src_ip != src_ip:
                continue
            if r.dst_ip and r.dst_ip != dst_ip:
                continue
            if r.port and r.port != port:
                continue
            if r.protocol and r.protocol.lower() != (protocol or '').lower():
                continue
            return True if r.action.lower() == 'allow' else False
        # default deny
        return False


def evaluate_traffic(rules_input, traffic_list):
    fw = Firewall()
    for r in rules_input:
        fw.add_rule(Rule(**r))
    results = []
    for t in traffic_list:
        allowed = fw.evaluate_single(t.get('src_ip'), t.get('dst_ip'), t.get('port'), t.get('protocol'))
        results.append({'traffic': t, 'allowed': allowed})
    return results
