"""Dependency-free, reproducible offline release build."""
from pathlib import Path
import html,re,zipfile
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT.parent
FILES=['index.html','style.css','data.js','expansion-data.js','mega-data.js','industry-data.js','engine.js','expansion-engine.js','mega-engine.js','industry-engine.js','expansion-ui.js','mega-ui.js','industry-ui.js','app.js','icon.svg','manifest.webmanifest','sw.js','README.md','docs/204-YENILIK-KATALOGU.md','docs/200-YENI-ISLETME-KARARI.md','scripts/make_industry_catalog.js','scripts/make_catalog.js','tests/sim.test.js','tests/expansion.test.js','tests/mega.test.js','tests/industry.test.js','tests/industry-browser.py','tests/browser-smoke.py','scripts/build.py']
contents=(ROOT/'index.html').read_text(encoding='utf8')
contents=contents.replace('<link rel="stylesheet" href="style.css">','<style>\n'+(ROOT/'style.css').read_text(encoding='utf8')+'\n</style>')
contents=contents.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">','')
contents=contents.replace('<link rel="manifest" href="manifest.webmanifest">','')
for source in ['data.js','expansion-data.js','mega-data.js','industry-data.js','engine.js','expansion-engine.js','mega-engine.js','industry-engine.js','expansion-ui.js','mega-ui.js','industry-ui.js','app.js']:
    js=(ROOT/source).read_text(encoding='utf8').replace('</script>','<\\/script>')
    target=f'<script src="{source}"></script>'
    if contents.count(target)!=1: raise RuntimeError(f'Script {source} not found exactly once')
    contents=contents.replace(target,'<script>\n'+js+'\n</script>')
if re.search(r'<script[^>]+src=|<link[^>]+href=',contents): raise RuntimeError('Single-file output has external script/style dependencies')
standalone=OUTPUT/'skyline-empire-v4-offline.html'
standalone.write_text(contents,encoding='utf8')
zip_path=OUTPUT/'skyline-empire-v4-source.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for file in FILES:
        if not (ROOT/file).exists(): raise RuntimeError('Missing '+file)
        z.write(ROOT/file,arcname='skyline-empire/'+file)
print('standalone',standalone,standalone.stat().st_size)
print('zip',zip_path,zip_path.stat().st_size)
