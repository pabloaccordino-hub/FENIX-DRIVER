const WEEKDAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function positive(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:0;}
function safeDate(v){const d=v instanceof Date?v:new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?null:d;}
function aggregate(rows){
  let net=0,gross=0,hours=0,km=0;
  for(const r of rows){net+=positive(r.net);gross+=positive(r.gross);hours+=positive(r.hours);km+=positive(r.km);}
  return {net,gross,hours,km,ratePerHour:hours?net/hours:0,netPerKm:km?net/km:0,netMargin:gross?net/gross:0,samples:rows.length};
}
export function predictWorkday({history=[],targetNet=0,currentNet=0,referenceDate=new Date(),startHour=null}={}){
  const target=positive(targetNet), current=positive(currentNet), remainingNet=Math.max(0,target-current);
  const date=safeDate(referenceDate)||new Date(), weekdayIndex=date.getDay(), weekday=WEEKDAYS[weekdayIndex];
  if(!remainingNet)return {weekday,weekdayIndex,remainingNet,estimatedHours:0,estimatedKm:0,estimatedGross:0,ratePerHour:0,netPerKm:0,source:'target',samples:0,confidence:'alta'};
  const rows=Array.isArray(history)?history:[];
  const weekdayRows=rows.filter(r=>{const d=safeDate(r.date);return d&&d.getDay()===weekdayIndex&&positive(r.hours)>0&&positive(r.net)>0;});
  let sourceRows=weekdayRows, source='weekday';
  if(!sourceRows.length){sourceRows=rows.filter(r=>positive(r.hours)>0&&positive(r.net)>0);source='overall';}
  if(!sourceRows.length)return {weekday,weekdayIndex,remainingNet,estimatedHours:null,estimatedKm:null,estimatedGross:null,ratePerHour:0,netPerKm:0,source:'insufficient',samples:0,confidence:'baja'};
  // If a start hour is selected, prefer same-hour samples; fall back to the weekday pool.
  if(startHour!==null&&sourceRows.length){const h=Math.max(0,Math.min(23,Number(startHour)||0));const sameHour=sourceRows.filter(r=>Math.max(0,Math.min(23,Number(r.startHour)||0))===h);if(sameHour.length>=2)sourceRows=sameHour;}
  const a=aggregate(sourceRows);
  const estimatedHours=a.ratePerHour?remainingNet/a.ratePerHour:null;
  const estimatedKm=a.netPerKm?remainingNet/a.netPerKm:null;
  const estimatedGross=a.netMargin?remainingNet/a.netMargin:null;
  const confidence=a.samples>=5?'alta':a.samples>=2?'media':'baja';
  return {weekday,weekdayIndex,remainingNet,estimatedHours,estimatedKm,estimatedGross,ratePerHour:a.ratePerHour,netPerKm:a.netPerKm,netMargin:a.netMargin,source,samples:a.samples,confidence,startHour};
}
export function predictiveMessage(p){
  if(!p||p.source==='insufficient')return `Todavía no tengo suficientes datos para predecir tu jornada de ${p?.weekday||'hoy'}.`;
  if(p.remainingNet===0)return 'Tu objetivo neto ya está cubierto. Fénix no proyecta horas adicionales.';
  const source=p.source==='weekday'?`según tus jornadas de ${p.weekday}`:'según tu historial general';
  if(p.estimatedHours===null)return `Tengo datos, pero todavía no alcanzan para calcular un tiempo confiable ${source}.`;
  return `Si salís con un rendimiento similar ${source}, necesitás aproximadamente ${Math.ceil(p.estimatedHours*60)} minutos para alcanzar el objetivo. Confianza ${p.confidence}.`;
}
