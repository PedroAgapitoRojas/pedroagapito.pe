(() => {
  'use strict';
  const lab = document.getElementById('backendLab');
  if (!lab) return;
  const $ = id => document.getElementById(id);
  const db = window.portfolioSupabaseClient || (window.supabase && window.PEDRO_SUPABASE?.url ? window.supabase.createClient(window.PEDRO_SUPABASE.url, window.PEDRO_SUPABASE.publishableKey, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null);
  const cfg = window.PEDRO_EXECUTION || {};
  const presets = {
    python:{file:'main.py',technology:'Python',code:'name = "Pedro"\nprint(f"Hola, {name}!")'},
    java:{file:'Main.java',technology:'Java',code:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hola, Pedro!");\n    }\n}'},
    kotlin:{file:'Main.kt',technology:'Kotlin',code:'fun main() {\n    println("Hola, Pedro!")\n}'},
    sqlite3:{file:'query.sql',technology:'SQL',code:'CREATE TABLE users (id INTEGER, name TEXT);\nINSERT INTO users VALUES (1, \'Pedro\');\nSELECT * FROM users;'},
    docker:{file:'Dockerfile',technology:'Docker',code:'FROM python:3.12\nWORKDIR /app\nCOPY . .\nCMD ["python", "main.py"]'}
  };
  let current = 'python', dirty = false, savedPracticeId = null;
  const open = () => { lab.classList.add('is-open'); lab.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; loadPreset(current); resumeExisting(current); };
  const close = () => { lab.classList.remove('is-open'); lab.setAttribute('aria-hidden','true'); if (!document.querySelector('.code-lab.is-open,.modal.active')) document.body.style.overflow=''; };
  function setStatus(text, error=false){ $('backendStatus').textContent=text; $('backendStatus').style.color=error?'#ff8f8f':''; }
  function loadPreset(lang){ current=lang; savedPracticeId=null; const p=presets[lang]; $('backendLanguage').value=lang; $('backendFileName').textContent=p.file; if(!dirty || !$('backendCode').value) $('backendCode').value=p.code; $('backendOutput').textContent='Escribe código y pulsa Ejecutar.'; $('backendExit').textContent='—'; setStatus('Listo'); }
  const statusLabels = {draft:'Borrador guardado',pending:'Pendiente de revisión',approved:'Publicada en Comunidad',rejected:'Requiere cambios',hidden:'Oculta por un moderador'};
  async function resumeExisting(lang){
    if(!db)return;
    const {data:session}=await db.auth.getSession(); const user=session?.session?.user; if(!user)return;
    const p=presets[lang];
    try{
      const {data:practice}=await db.from('practices').select('id,status').eq('user_id',user.id).eq('technology',p.technology).neq('status','archived').order('updated_at',{ascending:false}).limit(1).maybeSingle();
      if(!practice||current!==lang)return;
      const {data:file}=await db.from('practice_files').select('content').eq('practice_id',practice.id).eq('path',p.file).maybeSingle();
      if(!file||current!==lang)return;
      savedPracticeId=practice.id; dirty=false; $('backendCode').value=file.content;
      const label=statusLabels[practice.status]||practice.status;
      setStatus(`Retomando tu práctica guardada · ${label}`);
    }catch(_){ /* si falla, el editor simplemente se queda con el preset por defecto */ }
  }
  function dockerValidate(code){
    const lines=code.split(/\r?\n/).map(x=>x.trim()).filter(Boolean), errors=[], warnings=[], found=[];
    lines.forEach((line,i)=>{const cmd=line.split(/\s+/)[0].toUpperCase(); if(cmd==='FROM'||cmd==='WORKDIR'||cmd==='COPY'||cmd==='ADD'||cmd==='RUN'||cmd==='CMD'||cmd==='ENTRYPOINT'||cmd==='EXPOSE'||cmd==='ENV'||cmd==='ARG'||cmd==='USER') found.push(`${cmd} · línea ${i+1}`); else if(line.startsWith('#')){} else errors.push(`Instrucción no reconocida en línea ${i+1}: ${line}`)});
    if(!/^FROM\s+/im.test(code)) errors.unshift('Falta FROM: todo Dockerfile debe partir de una imagen base.');
    if(!/^(CMD|ENTRYPOINT)\s+/im.test(code)) warnings.push('No hay CMD/ENTRYPOINT; el contenedor puede no tener un proceso principal.');
    if(/--privileged|docker\.sock|\/dev\/docker/i.test(code)) warnings.push('Detectado acceso privilegiado al host; no se permite en el laboratorio.');
    return {errors,warnings,found};
  }
  async function run(){
    const code=$('backendCode').value, lang=current; setStatus('Ejecutando…'); $('backendOutput').textContent=''; $('backendExit').textContent='…';
    if(lang==='docker'){
      const r=dockerValidate(code); $('backendOutput').textContent=[r.errors.length?`ERRORES:\n${r.errors.join('\n')}`:'Sin errores de sintaxis básica.',r.warnings.length?`\nADVERTENCIAS:\n${r.warnings.join('\n')}`:'',`\nINSTRUCCIONES DETECTADAS:\n${r.found.join('\n')||'—'}`].filter(Boolean).join('\n'); $('backendExit').textContent=r.errors.length?'INVALIDO':'OK'; setStatus(r.errors.length?'Revisa el Dockerfile':'Validación completada',r.errors.length); return; }
    if(!cfg.endpoint){$('backendOutput').textContent='Configura PEDRO_EXECUTION.endpoint en js/execution-config.js.';$('backendExit').textContent='CONFIG';setStatus('Runner no configurado',true);return;}
    try{
      const payload={language:lang,files:[{name:presets[lang].file,content:code}],stdin:String($('backendStdin').value||'').slice(0,4000),args:[]};
      const res=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json().catch(()=>({message:'Respuesta no válida del runner'}));
      if(!res.ok) throw new Error(data.message||`Runner HTTP ${res.status}`);
      const compile=data.compile, run=data.run||{}; const out=[compile?.stdout,compile?.stderr,run.stdout,run.stderr].filter(Boolean).join('\n');
      $('backendOutput').textContent=out||'Proceso terminado sin salida.'; $('backendExit').textContent=String(run.code ?? compile?.code ?? 0); setStatus((run.code??0)===0?'Ejecutado ✓':'Terminó con errores',(run.code??0)!==0);
    }catch(err){$('backendOutput').textContent=err.message||'No se pudo ejecutar.';$('backendExit').textContent='ERROR';setStatus('Runner no disponible',true)}
  }
  async function save(){
    if(!db){localStorage.setItem('pa-backend-lab',JSON.stringify({language:current,code:$('backendCode').value,stdin:$('backendStdin').value}));setStatus('Guardado local ✓');return;}
    const {data:session}=await db.auth.getSession(); const user=session?.session?.user; if(!user){localStorage.setItem('pa-backend-lab',JSON.stringify({language:current,code:$('backendCode').value,stdin:$('backendStdin').value}));setStatus('Guardado local · inicia sesión para sincronizar');return;}
    const p=presets[current], title=`Práctica ${p.technology}`;
    if(savedPracticeId){
      const {error:updError}=await db.from('practice_files').update({content:$('backendCode').value,updated_at:new Date().toISOString()}).eq('practice_id',savedPracticeId).eq('path',p.file);
      if(updError){setStatus('No se pudo actualizar la práctica',true);return;}
      await db.from('practices').update({updated_at:new Date().toISOString()}).eq('id',savedPracticeId);
      setStatus('Práctica actualizada en Supabase ✓'); dirty=false; return;
    }
    const {data,error}=await db.from('practices').insert({user_id:user.id,title,technology:p.technology,status:'draft'}).select('id').single();
    if(error){setStatus('No se pudo guardar en Supabase',true);return;} const {error:fileError}=await db.from('practice_files').insert({practice_id:data.id,path:p.file,content:$('backendCode').value}); if(fileError){setStatus('Práctica creada; archivo pendiente',true);return;} savedPracticeId=data.id; setStatus('Guardado en Supabase ✓'); dirty=false;
  }
  async function publish(){
    const {data:session}=await db?.auth.getSession() || {data:{session:null}}; const user=session?.session?.user; if(!user){alert('Inicia sesión para publicar en la Comunidad.');return;}
    if(!confirm('Enviar práctica a Comunidad\n\nTu práctica será revisada antes de aparecer públicamente.\n\n¿Confirmas el envío?'))return;
    const p=presets[current]; const code=$('backendCode').value;
    try{
      const {error}=await db.rpc('submit_community_post',{p_title:`Práctica ${p.technology}`,p_nickname:(user.email||'PedroLab').split('@')[0].slice(0,30),p_technology:p.technology,p_code:code});
      if(error)throw error;
      // Enlaza esta práctica guardada con el post recién creado, para que
      // "Mis publicaciones" muestre su estado real (pendiente/aprobada/rechazada)
      // en vez de quedar como un envío suelto sin relación con el Laboratorio.
      if(savedPracticeId){
        try{
          const {data:recent}=await db.from('community_posts').select('id,created_at').eq('user_id',user.id).eq('technology',p.technology).order('created_at',{ascending:false}).limit(1).maybeSingle();
          if(recent?.id){
            await db.from('practices').update({post_id:recent.id,status:'pending'}).eq('id',savedPracticeId);
            const outputText=($('backendOutput').textContent||'').trim();
            if(outputText&&outputText!=='Escribe código y pulsa Ejecutar.')await db.rpc('attach_post_output',{p_post_id:recent.id,p_output:outputText});
          }
        }catch(_){ /* el envío a Comunidad ya se hizo bien; el enlace es solo informativo */ }
      }
      setStatus('Enviada a moderación ✓');
    }catch(err){setStatus(err.message||'No se pudo publicar',true)}
  }
  document.querySelectorAll('[data-backend-close]').forEach(b=>b.addEventListener('click',close));
  $('backendLanguage')?.addEventListener('change',e=>{dirty=false;loadPreset(e.target.value);resumeExisting(e.target.value)});
  $('backendCode')?.addEventListener('input',()=>{dirty=true;setStatus('Cambios sin ejecutar')});
  $('backendRun')?.addEventListener('click',run); $('backendSave')?.addEventListener('click',save); $('backendPublish')?.addEventListener('click',publish);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lab.classList.contains('is-open'))close()});
  window.openBackendLab = lang => { current=presets[lang] ? lang : 'python'; dirty=false; open(); };
})();
