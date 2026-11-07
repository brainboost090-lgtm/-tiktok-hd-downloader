const form=document.getElementById('link-form');
const input=document.getElementById('video-url');
const statusEl=document.getElementById('status');
const result=document.getElementById('result');
const preview=document.getElementById('preview');
const openLink=document.getElementById('open-link');
function isTikTokHost(host){return host==='tiktok.com'||host.endsWith('.tiktok.com');}
form.addEventListener('submit',async(e)=>{
 e.preventDefault(); statusEl.textContent='লিংক যাচাই করা হচ্ছে...'; result.hidden=true;
 try{
  const entered=new URL(input.value.trim());
  if(!isTikTokHost(entered.hostname)) throw new Error('শুধু TikTok লিংক দিন।');
  let finalUrl=entered.href;
  if(entered.hostname==='vm.tiktok.com'||entered.hostname==='vt.tiktok.com'||entered.hostname==='t.tiktok.com'){
   const response=await fetch('/.netlify/functions/resolve-tiktok?url='+encodeURIComponent(finalUrl));
   const data=await response.json();
   if(!response.ok||!data.url) throw new Error(data.error||'Short link resolve করা যায়নি। Full TikTok link ব্যবহার করুন।');
   finalUrl=data.url;
  }
  openLink.href=finalUrl;
  const videoId=finalUrl.match(/\/video\/(\d+)/)?.[1];
  preview.innerHTML='';
  if(videoId){
   const block=document.createElement('blockquote');
   block.className='tiktok-embed'; block.cite=finalUrl; block.dataset.videoId=videoId;
   block.style.maxWidth='605px'; block.style.minWidth='250px';
   const section=document.createElement('section'); block.appendChild(section); preview.appendChild(block);
   if(!document.getElementById('tiktok-embed-script')){const s=document.createElement('script');s.id='tiktok-embed-script';s.src='https://www.tiktok.com/embed.js';s.async=true;document.body.appendChild(s);}
  } else {preview.textContent='লিংকটি TikTok-এ খুলে ভিডিওটি দেখুন।';}
  result.hidden=false; statusEl.textContent='';
 }catch(err){statusEl.textContent=err.message||'লিংকটি যাচাই করা যায়নি।';}
});