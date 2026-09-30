from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="function stockRows(){let m={};"
new="function stockRows(){let m={};let validCats=new Set(db.cats.map(c=>String(c.name||'').trim()));"
if old not in s:
    raise SystemExit('stockRows start not found')
s=s.replace(old,new,1)
old2="return Object.values(m).map(x=>({...x,adj:x.adj||0,qty:x.imp-x.sold+(x.adj||0)}))}"
new2="return Object.values(m).filter(x=>validCats.has(String(x.cat||'').trim())).map(x=>({...x,adj:x.adj||0,qty:x.imp-x.sold+(x.adj||0)}))}"
if old2 not in s:
    raise SystemExit('stockRows return not found')
s=s.replace(old2,new2,1)
p.write_text(s,encoding='utf-8')
