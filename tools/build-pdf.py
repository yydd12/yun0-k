# -*- coding: utf-8 -*-
"""index.html -> portfolio.pdf (A4 가로, 프로젝트 상세 포함).

<template> 안에 있는 프로젝트 상세 모달을 본문으로 펼친 인쇄용 사본을 만든 뒤
headless Chrome으로 인쇄한다. 레이아웃/페이지 분할 규칙은 css/style.css의
@media print 블록에 있다.

    python tools/build-pdf.py
"""
import io, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
TMP = os.path.join(ROOT, 'portfolio-print.html')   # 임시 사본 (상대경로 때문에 프로젝트 루트에 생성)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'portfolio.pdf')

CHROME = next((p for p in (
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
) if os.path.exists(p)), None)
if not CHROME:
    sys.exit('Chrome/Edge를 찾지 못했습니다.')

src = io.open(SRC, encoding='utf-8').read()
blocks = re.findall(r'<template id="project-modal-([^"]+)">(.*?)</template>', src, re.S)
if not blocks:
    sys.exit('project-modal 템플릿을 찾지 못했습니다.')

detail = u'\n'.join(u'<div class="print-detail" id="print-detail-%s">%s</div>' % b for b in blocks)
out = src.replace(u'</main>', detail + u'\n</main>', 1)
if out == src:
    sys.exit('</main>을 찾지 못했습니다.')
out = out.replace('css/style.css', 'css/style.css?v=%d' % os.path.getmtime(os.path.join(ROOT, 'css', 'style.css')))
io.open(TMP, 'w', encoding='utf-8', newline='\n').write(out)

TMPPDF = OUT + '.tmp'
profile = tempfile.mkdtemp(prefix='pdfbuild-')
try:
    subprocess.check_call([
        CHROME, '--headless', '--disable-gpu', '--no-sandbox',
        '--user-data-dir=' + profile,   # 매번 빈 프로필 — file:// CSS 캐시 방지
        '--virtual-time-budget=15000',          # lazy 이미지까지 로드될 시간
        '--run-all-compositor-stages-before-draw',
        '--no-pdf-header-footer',               # 날짜/URL/쪽번호 머리글·바닥글 제거
        '--print-to-pdf=' + TMPPDF,
        'file:///' + TMP.replace(os.sep, chr(47)),
    ])
finally:
    os.remove(TMP)
    shutil.rmtree(profile, ignore_errors=True)

if not os.path.exists(TMPPDF) or os.path.getsize(TMPPDF) == 0:
    sys.exit('Chrome가 PDF를 쓰지 못했습니다.')
try:
    os.replace(TMPPDF, OUT)          # 열려 있으면 여기서 실패한다 — 조용히 오래된 PDF를 남기지 않도록
except OSError as e:
    os.remove(TMPPDF)
    sys.exit('%s 파일이 사용 중입니다(PDF 뷰어 등). 닫고 다시 실행하세요. (%s)' % (OUT, e))

print('%s (%d detail blocks)' % (OUT, len(blocks)))
