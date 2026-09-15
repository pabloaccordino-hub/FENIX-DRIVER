const UBER_PEAKS = {
  0: [[0,4],[7,10],[16,21]],
  1: [[0,4],[7,10],[16,21]],
  2: [[0,4],[7,10],[16,21]],
  3: [[0,4],[7,10],[16,21]],
  4: [[0,4],[7,10],[16,21]],
  5: [[0,4],[7,10],[16,24]],
  6: [[0,10],[15,24]],
};
function inWindow(hour, windows){return windows.some(([a,b])=>hour>=a && hour<b);}
export function analyzeExternalContext({city='',platform='',weekday=new Date().getDay(),hour=new Date().getHours(),fuelPrice=0,baselineFuelPrice=0}={}){
 const h=Math.max(0,Math.min(23,Number(hour)||0)); const wd=Math.max(0,Math.min(6,Number(weekday)||0));
 const isMendoza=String(city).trim().toLowerCase()==='mendoza';
 const uberPeak=String(platform).toLowerCase()==='uber' && inWindow(h,UBER_PEAKS[wd]);
 const platformSignal=String(platform).toLowerCase()==='cabify' && isMendoza ? 'corporativo' : uberPeak ? 'demanda_pico' : 'general';
 const fuelPressure=fuelPrice>0&&baselineFuelPrice>0&&fuelPrice>=baselineFuelPrice*1.05?'alta':fuelPrice>0&&baselineFuelPrice>0&&fuelPrice>=baselineFuelPrice*0.98?'media':'baja';
 const signals=(uberPeak?1:0)+(platformSignal==='corporativo'?1:0)+(fuelPressure==='alta'?1:0);
 const confidence=signals>=2?'alta':signals===1?'media':'baja';
 const message=uberPeak?'Hay una ventana pico de alta demanda de Uber para esta franja según sus tendencias publicadas.':platformSignal==='corporativo'?'Cabify destaca viajes corporativos y mayor demanda/precios como oportunidad en Mendoza.':fuelPressure==='alta'?'El combustible está por encima de tu referencia: Fénix debe exigir un rendimiento mayor antes de recomendar continuar.':'No hay suficientes señales externas específicas para cambiar tu estrategia.';
 return {city,platform,weekday:wd,hour:h,peak:uberPeak,platformSignal,fuelPressure,score:signals,confidence,message,sourceNotes:['Uber: tendencias horarias y mapa de demanda','Cabify: viajes corporativos en Mendoza','Combustible: referencia configurada por el conductor']};
}
export function contextMessage(r){return r?.message||'Fénix no tiene señales externas.';}
