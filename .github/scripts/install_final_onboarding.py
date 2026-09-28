from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
needle = '  <script src="./script.js?v=5"></script>\n'
tag = '  <script src="./controls-onboarding-final.js?v=1"></script>\n'
if tag not in s:
    if needle not in s:
        raise SystemExit('script.js tag not found')
    s = s.replace(needle, needle + tag, 1)
p.write_text(s, encoding='utf-8')
