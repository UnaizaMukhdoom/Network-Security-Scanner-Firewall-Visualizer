from firewall import Firewall, Rule


def test_allow_rule():
    fw = Firewall()
    fw.add_rule(Rule(id=1, action='allow', src_ip='10.0.0.1', dst_ip='127.0.0.1', port=22))
    assert fw.evaluate_single('10.0.0.1', '127.0.0.1', 22) is True


def test_deny_rule_priority():
    fw = Firewall()
    fw.add_rule(Rule(id=1, action='allow', src_ip=None, dst_ip='127.0.0.1', port=80, priority=200))
    fw.add_rule(Rule(id=2, action='deny', src_ip='10.0.0.2', dst_ip='127.0.0.1', port=80, priority=50))
    # traffic from 10.0.0.2 should be denied due to higher-priority deny
    assert fw.evaluate_single('10.0.0.2', '127.0.0.1', 80) is False
    # traffic from another host should be allowed
    assert fw.evaluate_single('10.0.0.3', '127.0.0.1', 80) is True
