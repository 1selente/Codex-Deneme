"""Fast UI smoke for v4 interactive controls and mobile navigation."""
from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parents[1]
scripts=['data.js','expansion-data.js','mega-data.js','industry-data.js','engine.js','expansion-engine.js','mega-engine.js','industry-engine.js','expansion-ui.js','mega-ui.js','industry-ui.js','app.js']
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
for js in scripts:
 html=html.replace('<script src="'+js+'"></script>','<script>'+(root/js).read_text().replace('</script>','<\\/script>')+'</script>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [1280,390]:
  page=browser.new_page(viewport={'width':width,'height':780})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('about:blank')
  page.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},configurable:true})")
  page.set_content(html,wait_until='domcontentloaded')
  page.locator('#new-game-form input[name="name"]').fill('Mega Havayolu')
  page.locator('#new-game-form button[type="submit"]').click()
  assert page.locator('#company-title').inner_text()=='Mega Havayolu'
  for v in ['network','corporate','supply','competition','compliance','treasury']:
   if width<680:page.locator('#mobile-menu').click()
   page.locator(f'.sidebar [data-view="{v}"]').click()
   assert page.locator('.exp-row').count()>=12,(width,v)
   assert not errors,(width,v,errors)
   if v=='network':
    page.evaluate("document.querySelector('[data-action=\"industry-slot\"][data-id=\"slot-IST\"]').click()")
    assert 'Tahsisli' in page.locator('#view').inner_text()
    page.evaluate("document.querySelector('[data-action=\"industry-wave\"][data-id=\"IST:wave-0\"]').click()")
   if v=='corporate':
    page.evaluate("document.querySelector('[data-action=\"industry-corporate\"][data-id=\"biz-0\"]').click()")
    assert 'hafta' in page.locator('#view').inner_text()
    page.evaluate("document.querySelector('[data-action=\"industry-ancillary\"][data-id=\"extra-0\"]').click()")
   if v=='supply':
    page.evaluate("document.querySelector('[data-action=\"industry-vendor\"][data-id=\"vendor-0-0\"]').click()")
    page.evaluate("document.querySelector('[data-action=\"industry-order\"][data-id=\"order-regional\"]').click()")
   if v=='competition':
    page.evaluate("document.querySelector('[data-action=\"industry-tactic\"][data-id=\"tactic-0\"]').click()")
   if v=='compliance':
    page.evaluate("document.querySelector('[data-action=\"industry-safety\"][data-id=\"safety-0\"]').click()")
    page.evaluate("document.querySelector('[data-action=\"industry-labor\"][data-id=\"labor-0-0\"]').click()")
    page.evaluate("document.querySelector('[data-action=\"industry-contingency\"][data-id=\"cont-0-0\"]').click()")
   if v=='treasury':
    page.evaluate("document.querySelector('[data-action=\"industry-bond\"][data-id=\"bond-0\"]').click()")
  page.locator('[data-action="advance"][data-weeks="1"]').click()
  assert not errors,errors
  print('PASS',width,'6 new views, 11 decisions, turn progression')
  page.close()
 browser.close()
