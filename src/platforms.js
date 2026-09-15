export const PLATFORM_NAMES = ['Uber','Cabify','DiDi','inDrive','Otra'];
function positive(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:0;}
function normalizePlatform(v){return PLATFORM_NAMES.includes(v)?v:'Otra';}
export function summarizePlatforms(rows=[]){
  const platforms=Object.fromEntries(PLATFORM_NAMES.map(name=>[name,{net:0,gross:0,hours:0,km:0,trips:0,hourlyNet:0,netPerKm:0}]));
  for(const row of Array.isArray(rows)?rows:[]){
    const p=platforms[normalizePlatform(row.platform)];
    p.net+=positive(row.net); p.gross+=positive(row.gross); p.hours+=positive(row.hours); p.km+=positive(row.km); p.trips+=1;
  }
  for(const p of Object.values(platforms)){p.hourlyNet=p.hours?p.net/p.hours:0;p.netPerKm=p.km?p.net/p.km:0;}
  const usable=Object.entries(platforms).filter(([,p])=>p.hours>0&&p.net>0);
  const best=usable.sort((a,b)=>b[1].hourlyNet-a[1].hourlyNet)[0];
  const total=Object.values(platforms).reduce((a,p)=>({net:a.net+p.net,gross:a.gross+p.gross,hours:a.hours+p.hours,km:a.km+p.km,trips:a.trips+p.trips}),{net:0,gross:0,hours:0,km:0,trips:0});
  total.hourlyNet=total.hours?total.net/total.hours:0; total.netPerKm=total.km?total.net/total.km:0;
  return {platforms,total,bestPlatform:best?.[0]??null};
}
export function platformMessage(summary){
  if(!summary?.total?.trips)return 'Registrá viajes en Uber, Cabify u otra plataforma para que Fénix pueda compararlas.';
  if(!summary.bestPlatform)return 'Fénix todavía necesita horas y ganancias reales para comparar plataformas.';
  const p=summary.platforms[summary.bestPlatform];
  return `${summary.bestPlatform} es tu mejor rendimiento registrado: $${Math.round(p.hourlyNet).toLocaleString('es-AR')}/h netos.`;
}
