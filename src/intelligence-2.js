const WEEKDAYS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const positive=v=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):0;
const clean=v=>String(v??'').trim();
const hourDistance=(a,b)=>{const d=Math.abs(a-b);return Math.min(d,24-d)};
function safeDate(v){const d=v instanceof Date?v:new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?null:d;}
function validRows(history,weekday,targetHour){return (Array.isArray(history)?history:[]).filter(r=>{const d=safeDate(r.date);return d&&d.getDay()===weekday&&positive(r.net)>0&&positive(r.hours)>0&&clean(r.zone)&&clean(r.platform)&&hourDistance(positive(r.startHour),targetHour)<=2;});}
function aggregate(rows){let net=0,hours=0,km=0,gross=0;for(const r of rows){net+=positive(r.net);hours+=positive(r.hours);km+=positive(r.km);gross+=positive(r.gross);}return {net,hours,km,gross,rate:hours?net/hours:0,netPerKm:km?net/km:0,samples:rows.length};}
export function recommendStrategy({history=[],referenceDate=new Date(),startHour=null,targetNet=0,currentNet=0,currentZone='',currentPlatform='',vehicleCostPerKm=0}={}){
 const target=positive(targetNet),net=positive(currentNet),remaining=Math.max(0,target-net),date=safeDate(referenceDate)||new Date(),weekday=date.getDay(),hour=startHour===null?date.getHours():Math.max(0,Math.min(23,Number(startHour)||0));
 if(target>0&&net>=target)return {action:'TERMINÁ',tone:'fire',weekday:WEEKDAYS[weekday],zone:clean(currentZone)||null,platform:clean(currentPlatform)||null,startHour:hour,expectedHourlyNet:0,estimatedHours:0,estimatedKm:0,samples:0,confidence:'alta',reason:'Tu objetivo neto ya está cubierto.'};
 const rows=validRows(history,weekday,hour);
 const buckets=new Map();
 for(const r of rows){const key=`${clean(r.zone)}|||${clean(r.platform)}`;const list=buckets.get(key)||[];list.push(r);buckets.set(key,list);}
 const combos=[...buckets.entries()].map(([key,list])=>{const [zone,platform]=key.split('|||');const a=aggregate(list);return {zone,platform,...a};}).filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate||b.samples-a.samples);
 if(!combos.length)return {action:'APRENDIENDO',tone:'muted',weekday:WEEKDAYS[weekday],zone:null,platform:null,startHour:hour,expectedHourlyNet:0,estimatedHours:null,estimatedKm:null,samples:0,confidence:'baja',reason:`Fénix todavía no tiene evidencia suficiente para recomendar una combinación de zona y plataforma para ${WEEKDAYS[weekday]}.`};
 const best=combos[0], confidence=best.samples>=5?'alta':best.samples>=2?'media':'baja';
 const sameContext=combos.find(x=>clean(currentZone)&&x.zone.toLowerCase()===clean(currentZone).toLowerCase()&&clean(currentPlatform)&&x.platform.toLowerCase()===clean(currentPlatform).toLowerCase());
 const currentPlatformRows=combos.filter(x=>clean(currentPlatform)&&x.platform.toLowerCase()===clean(currentPlatform).toLowerCase());
 const bestPlatform=combos.find(x=>clean(currentZone)&&x.zone.toLowerCase()===clean(currentZone).toLowerCase()&&x.platform.toLowerCase()!==clean(currentPlatform).toLowerCase()) || best;
 let action='SALÍ',tone='green',reason=`La mejor combinación histórica para ${WEEKDAYS[weekday]} cerca de las ${String(hour).padStart(2,'0')}:00 es ${best.zone} con ${best.platform}.`;
 if(clean(currentPlatform)&&best.platform.toLowerCase()!==clean(currentPlatform).toLowerCase()&&sameContext&&bestPlatform.rate>=Math.max(positive(sameContext.rate)*1.25,positive(sameContext.rate)+1000)){
   action='CAMBIÁ DE PLATAFORMA';tone='purple';reason=`En ${bestPlatform.zone}, ${bestPlatform.platform} rinde mejor que ${currentPlatform} según tu historial.`;
 } else if(clean(currentZone)&&best.zone.toLowerCase()!==clean(currentZone).toLowerCase()&&sameContext&&best.rate>=Math.max(positive(sameContext.rate)*1.25,positive(sameContext.rate)+1000)){
   action='CAMBIÁ DE ZONA';tone='amber';reason=`Tu historial muestra una ventaja clara de ${best.zone} frente a ${currentZone} en esta ventana.`;
 } else if(remaining>0&&best.rate>0){reason+=` Ritmo esperado: $${Math.round(best.rate).toLocaleString('es-AR')}/h netos.`;}
 const estimatedHours=remaining>0?remaining/best.rate:0, estimatedKm=remaining>0&&best.netPerKm?remaining/best.netPerKm:0;
 return {action,tone,weekday:WEEKDAYS[weekday],zone:best.zone,platform:best.platform,startHour:hour,expectedHourlyNet:best.rate,estimatedHours,estimatedKm,samples:best.samples,confidence,reason,ranking:combos.slice(0,8),vehicleCostPerKm:positive(vehicleCostPerKm),remainingNet:remaining};
}
export function strategyMessage(result){return result?.reason||'Fénix está analizando tu jornada.';}
