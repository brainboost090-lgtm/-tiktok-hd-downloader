const form=document.getElementById('form'), input=document.getElementById('url'), statusBox=document.getElementById('status'), result=document.getElementById('result'), formatsBox=document.getElementById('formats');
form.addEventListener('submit',async e=>{
 e.preventDefault(); result.hidden=true; formatsBox.replaceChildren(); statusBox.textContent='ভিডিও খোঁজা হচ্ছে…';
 try{
  const r=await fetch('/api/info?url='+encodeURIComponent(input.value.trim()));
  const d=await r.json(); if(!r.ok) throw new Error(d.detail||'ভিডিও পাওয়া যায়নি');
  document.getElementById('title').textContent=d.title||'TikTok video';
  const thumb=document.getElementById('thumb'); if(d.thumbnail){thumb.src=d.thumbnail;thumb.hidden=false}else{thumb.hidden=true}
  if(!d.formats||!d.formats.length) throw new Error('ডাউনলোডযোগ্য ফরম্যাট পাওয়া যায়নি');
  d.formats.forEach((f,i)=>{
   const row=document.createElement('div'); row.className='format';
   const label=document.createElement('span'); label.textContent=(f.height?f.height+'p':'Available')+' • '+(f.ext||'video').toUpperCase();
   const a=document.createElement('a'); a.href=f.url; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent='Download'; a.download='';
   row.append(label,a); formatsBox.append(row);
  });
  result.hidden=false; statusBox.textContent='উপলভ্য কোয়ালিটি পাওয়া গেছে।';
 }catch(err){statusBox.textContent=err.message||'সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'}
});
