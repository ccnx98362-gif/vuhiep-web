from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit('Missing '+label)
    s=s.replace(old,new,1)

rep("['other','Đồng hồ / phụ kiện'],['report','Báo cáo']]","['other','Đồng hồ / phụ kiện'],['report','Báo cáo'],['settings','Cài đặt / PIN']]",'menu')
rep("if(p==='report')h=report();document.querySelector('#main').innerHTML","if(p==='report')h=report();if(p==='settings')h=settings();document.querySelector('#main').innerHTML",'render')
helper="function adminPin(){return localStorage.getItem('vuhiep_admin_pin')||''}function requireAdminPin(){let current=adminPin();if(!current){alert('Bạn chưa cài mã PIN quản trị. Vào Cài đặt / PIN để tạo PIN trước.');return false}let entered=prompt('Nhập mã PIN quản trị để tiếp tục:');if(entered===null)return false;if(entered!==current){alert('Mã PIN không đúng.');return false}return true}function settings(){return'<h2>Cài đặt / PIN quản trị</h2><div class=\"card\"><p class=\"muted\">PIN dùng để bảo vệ thao tác xóa dữ liệu.</p><div class=\"form\"><div><label>PIN hiện tại</label><input id=\"oldPin\" type=\"password\" inputmode=\"numeric\"></div><div><label>PIN mới</label><input id=\"newPin\" type=\"password\" inputmode=\"numeric\" placeholder=\"Tối thiểu 4 số\"></div><div><label>Nhập lại PIN mới</label><input id=\"newPin2\" type=\"password\" inputmode=\"numeric\"></div><div style=\"align-self:end\"><button class=\"btn\" id=\"savePin\">Lưu / đổi PIN</button></div></div></div>'}"
rep('function tbl(head,rows){',helper+'function tbl(head,rows){','helper')
rep("if(!c)return;if(!confirm('Xóa danh mục","if(!c)return;if(!requireAdminPin())return;if(!confirm('Xóa danh mục",'delete guard')
bind="if(p==='settings'){let b=document.querySelector('#savePin');if(b)b.onclick=()=>{let old=oldPin.value.trim(),n=newPin.value.trim(),n2=newPin2.value.trim(),cur=adminPin();if(cur&&old!==cur)return alert('PIN hiện tại không đúng.');if(!/^\\d{4,}$/.test(n))return alert('PIN mới phải có ít nhất 4 chữ số.');if(n!==n2)return alert('Hai lần nhập PIN mới chưa giống nhau.');localStorage.setItem('vuhiep_admin_pin',n);oldPin.value=newPin.value=newPin2.value='';alert('Đã lưu PIN quản trị.')}}"
rep("if(p==='stock')document.querySelectorAll('.adjustStock')",bind+"if(p==='stock')document.querySelectorAll('.adjustStock')",'settings bind')
oldnorm="function normalize(){db.cats??=[];db.imports??=[];db.sales??=[];db.frames??=[];db.other??=[];db.contacts??=[];db.adjustments??=[]}"
newnorm="function normalize(){db.cats??=[];db.imports??=[];db.sales??=[];db.frames??=[];db.other??=[];db.contacts??=[];db.adjustments??=[];if(!db._blueClCleaned){let bad=x=>String(x?.cat||x?.name||'').trim().toUpperCase()==='BLUE CL';db.cats=db.cats.filter(c=>!bad(c));db.imports=db.imports.filter(x=>!bad(x));db.adjustments=db.adjustments.filter(x=>!bad(x));db._blueClCleaned=true}}"
rep(oldnorm,newnorm,'normalize')
p.write_text(s,encoding='utf-8')
