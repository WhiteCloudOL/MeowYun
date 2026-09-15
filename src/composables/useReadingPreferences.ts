import { reactive } from 'vue'
import { readPreference, writePreference } from '@/utils/preferences'
const defaults={fontSize:18,lineHeight:1.9}
function load(){try{const value=JSON.parse(readPreference('meowyun-reading-settings')??'null');return {fontSize:[16,18,20,22].includes(value?.fontSize)?value.fontSize:18,lineHeight:[1.7,1.9,2.1].includes(value?.lineHeight)?value.lineHeight:1.9}}catch{return {...defaults}}}
const settings=reactive(load())
export function useReadingPreferences(){return {settings,setFontSize:(value:number)=>{if([16,18,20,22].includes(value)){settings.fontSize=value;writePreference('meowyun-reading-settings',JSON.stringify(settings))}},setLineHeight:(value:number)=>{if([1.7,1.9,2.1].includes(value)){settings.lineHeight=value;writePreference('meowyun-reading-settings',JSON.stringify(settings))}},reset:()=>{Object.assign(settings,defaults);writePreference('meowyun-reading-settings',JSON.stringify(settings))}}}
