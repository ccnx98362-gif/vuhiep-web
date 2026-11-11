import fs from "node:fs/promises";
const html = await fs.readFile("index.html","utf8");
const match = html.match(/SB_URL='([^']+)',SB_KEY='([^']+)'/);
if (!match) throw new Error("Supabase public configuration missing");
const [, url, key] = match;
const email = process.env.VH_BACKUP_EMAIL;
const password = process.env.VH_BACKUP_PASSWORD;
if (!email || !password) throw new Error("Configure VH_BACKUP_EMAIL and VH_BACKUP_PASSWORD as GitHub Actions secrets");
const login = await fetch(url + "/auth/v1/token?grant_type=password", {
  method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},
  body:JSON.stringify({email,password}),signal:AbortSignal.timeout(20000)
});
if (!login.ok) throw new Error("Supabase authentication error " + login.status);
const {access_token} = await login.json();
if (!access_token) throw new Error("Supabase did not return access token");
const r = await fetch(url + "/rest/v1/vuhiep_store?id=eq.main&select=updated_at,data", {
  headers:{"apikey":key,"Authorization":"Bearer "+access_token},
  signal:AbortSignal.timeout(20000)
});
if (!r.ok) throw new Error("Supabase database unavailable " + r.status);
const records = await r.json();
if (records.length!==1 || !records[0]?.data || typeof records[0].data !== "object") {
  throw new Error("Missing store record: no backup will be created");
}
console.log("Supabase authenticated read OK; updated_at="+records[0].updated_at);
if (process.env.VH_BACKUP !== "1") process.exit(0);
const crypto = await import("node:crypto");
const passphrase=process.env.VH_BACKUP_PASSPHRASE;
if (!passphrase || passphrase.length < 32) throw new Error("Configure VH_BACKUP_PASSPHRASE (at least 32 random characters)");
const salt=crypto.randomBytes(24), iv=crypto.randomBytes(12);
const cipher=crypto.createCipheriv("aes-256-gcm",
  crypto.scryptSync(passphrase,salt,32,{N:32768,r:8,p:1,maxmem:67108864}),iv);
const raw=Buffer.from(JSON.stringify({timestamp:new Date().toISOString(),record:records[0]}));
const ciphertext=Buffer.concat([cipher.update(raw),cipher.final()]);
const payload={format:"VH-AES256-GCM-1",salt:salt.toString("base64"),iv:iv.toString("base64"),
  tag:cipher.getAuthTag().toString("base64"),ciphertext:ciphertext.toString("base64")};
await fs.mkdir("encrypted-backups",{recursive:true});
await fs.writeFile("encrypted-backups/vuhiep.enc.json",JSON.stringify(payload),{mode:0o600});
console.log("Encrypted backup written. No plaintext data was uploaded to GitHub.");