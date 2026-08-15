import {
  authenticatePilot, drawPulseWinners, getPilotSession, launchFinalPulse, loadPilotState, logoutPilot, proposeMeeting,
  recognizeCrew, resetPilotState, respondAffirmation, sendAffirmation, submitPulse, updatePrize,
  type PilotSession, type PilotState, type PrizeConfig,
} from './pilotRuntime'
import { getAccount, pilotDirectory as localPilotDirectory } from './pilotRuntime'
import type { PilotAccount, PilotSailing, CrewMember, Department } from './pilotData'
import { queueOfflineAction, readOfflineQueue, removeOfflineAction } from './offline'

const API_BASE=(import.meta.env.VITE_CRUISE_API_BASE || 'https://phhpiqwvgwlgjmyiksqe.supabase.co/functions/v1/cruiseconnect-api-v3').replace(/\/$/,'')
const API_TOKEN='cruise-connection-pilot-api-token-v3'
const API_SESSION='cruise-connection-pilot-api-session-v3'
const API_ACCOUNT='cruise-connection-pilot-api-account-v3'

export type RemoteDirectory = {
  sailing: PilotSailing
  accounts: PilotAccount[]
  crew: CrewMember[]
  departments: Department[]
  activities?: Array<{ id:string; title:string; category:string; starts_at?:string; capacity?:number; remaining_capacity?:number; booking_route?:string }>
  promotions?: Promotion[]
}

export type Promotion = { id:string; title:string; category:string; message:string; incentive?:string; activityId?:string; bookingRoute?:string; targetInterests:string[]; targetAgeBands:string[]; status:'draft'|'scheduled'|'live'|'paused'|'ended'; startsAt?:string; endsAt?:string; impressions?:number; clicks?:number; bookings?:number; revenue?:number }

export type ParticipationCampaign = {
  id:string; slug:string; title:string; message:string; campaignType:'raffle'|'poll'|'trivia'|'check_in'|'activity'|'feedback'|'pulse_completion';
  entryMode:'tap'|'qr'|'answer'|'check_in'|'completion'; status:'draft'|'scheduled'|'live'|'closed'|'drawn'|'ended'; prompt?:string; options:string[];
  showLiveResults:boolean; targetInterests:string[]; targetAgeBands:string[]; noPurchaseRequired:boolean; winnerCount:number; adultPrize?:string; alternatePrize?:string;
  activityId?:string; startsAt?:string; endsAt?:string; createdAt?:string; updatedAt?:string; participants?:number; eligible?:number;
  entered?:boolean; entryCode?:string; myResponse?:string; qualified?:boolean; enteredAt?:string; won?:boolean; myPrize?:string; winnerRank?:number;
  winners?:Array<{passenger_account_id:string;entryCode?:string;rank:number;prize:string;drawn_at:string}>;
}
export type IntegrationConnector = { type:string; mode:'simulation'|'manual_import'|'api'|'native_bridge'; status:'not_configured'|'ready'|'connected'|'error'; detail:string; updatedAt:string }
export type MyServiceIssue = { id:string; department_id?:string; category:string; status:string; submitted_at:string; resolved_at?:string; postRecoveryScore?:number }
export type StaffOverview = {
  pulse?: { completed:number; totalPassengers:number; completionRate:number; departments:Array<{id:string;name:string;icon:string;average:number;count:number}> }
  serviceIssues?: Array<{id:string;passenger_account_id:string;department_id?:string;category:string;status:string;submitted_at:string;acknowledged_at?:string;resolved_at?:string;assigned_to_account_id?:string;resolution_code?:string}>
  promotions?: Promotion[]
  crew?: Array<{id:string;firstName:string;lastName:string;department:string;totalRecognitions:number;liveRecognitions:number;uniqueGuests:number}>
  activities?: Array<{id:string;title:string;category:string;remaining_capacity?:number}>
  commerce?: {events:number;attributableRevenue:number}
}

const remoteToken=()=>sessionStorage.getItem(API_TOKEN)
const readJson=<T,>(key:string):T|null=>{try{const raw=sessionStorage.getItem(key);return raw?JSON.parse(raw) as T:null}catch{return null}}
const remoteSession=():PilotSession|null=>readJson<PilotSession>(API_SESSION)
const remoteAccount=():PilotAccount|null=>readJson<PilotAccount>(API_ACCOUNT)
const headers=()=>({'Content-Type':'application/json',...(remoteToken()?{Authorization:`Bearer ${remoteToken()}`}:{})})

async function request<T>(path:string,options:RequestInit={},idempotencyKey?:string,timeoutMs=5000):Promise<T>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs)
  try{
    const response=await fetch(`${API_BASE}${path}`,{...options,headers:{...headers(),...(idempotencyKey?{'X-Idempotency-Key':idempotencyKey}:{}),...(options.headers||{})},signal:controller.signal})
    const body=await response.json().catch(()=>({}))
    if(!response.ok){const err=new Error((body as {error?:string}).error||`Cruise Connection API ${response.status}`);(err as Error&{status?:number}).status=response.status;throw err}
    return body as T
  } finally {clearTimeout(timer)}
}

const networkFailure=(error:unknown)=>error instanceof DOMException&&error.name==='AbortError'||error instanceof TypeError
const storeRemoteSession=(session:PilotSession,account?:PilotAccount)=>{
  sessionStorage.setItem(API_TOKEN,session.token)
  sessionStorage.setItem(API_SESSION,JSON.stringify(session))
  if(account) sessionStorage.setItem(API_ACCOUNT,JSON.stringify(account))
}

export async function clientLogin(accountId:string,pin:string):Promise<PilotSession|null>{
  try{
    const body=await request<{session:PilotSession;account:PilotAccount}>('/auth/simulate',{method:'POST',body:JSON.stringify({accountId,pin})},undefined,7000)
    storeRemoteSession(body.session,body.account);return body.session
  }catch(error){
    if(!networkFailure(error)&&(error as Error&{status?:number}).status) return null
    return authenticatePilot(accountId,pin)
  }
}

export async function clientHostLogin(launchToken:string):Promise<PilotSession>{
  const body=await request<{session:PilotSession;account:PilotAccount}>('/auth/host',{method:'POST',body:JSON.stringify({launchToken})},undefined,7000)
  storeRemoteSession(body.session,body.account)
  return body.session
}

export const clientSession=()=>remoteSession()||getPilotSession()
export const clientAccount=()=>remoteAccount()||(()=>{const s=clientSession();return s?getAccount(s.accountId):undefined})()
export const clientLogout=()=>{sessionStorage.removeItem(API_TOKEN);sessionStorage.removeItem(API_SESSION);sessionStorage.removeItem(API_ACCOUNT);logoutPilot()}
export const clientMode=()=>remoteToken()?'Supabase shared pilot API':'offline simulation fallback'

export async function flushPilotQueue(){
  if(!remoteToken()) return 0
  const queued=readOfflineQueue().filter(a=>a.type==='PILOT_API'&&typeof a.payload.path==='string')
  let flushed=0
  for(const action of queued){
    try{
      await request<{state:PilotState}>(String(action.payload.path),{method:'POST',body:JSON.stringify(action.payload.body||{})},action.id)
      removeOfflineAction(action.id);flushed++
    }catch(error){
      if(networkFailure(error)) break
      const status=(error as Error&{status?:number}).status
      if(status&&status>=400&&status<500){removeOfflineAction(action.id);flushed++;continue}
      break
    }
  }
  return flushed
}

export async function clientLoadState():Promise<PilotState>{
  if(remoteToken()){
    try{
      await flushPilotQueue()
      return (await request<{state:PilotState}>('/pilot/state')).state
    }catch(error){
      const status=(error as Error&{status?:number}).status
      if(status===401){clientLogout();return loadPilotState()}
      if(!networkFailure(error))throw error
    }
  }
  return loadPilotState()
}

export async function clientLoadDirectory():Promise<RemoteDirectory>{
  if(remoteToken()){
    try{return (await request<{directory:RemoteDirectory}>('/pilot/directory')).directory}
    catch(error){if(!networkFailure(error))throw error}
  }
  return { sailing: localPilotDirectory.sailing, accounts: localPilotDirectory.accounts, crew: localPilotDirectory.crew, departments: localPilotDirectory.departments }
}

async function remoteOrLocal(actionType:string,path:string,body:Record<string,unknown>,local:()=>PilotState):Promise<PilotState>{
  if(remoteToken()){
    try{return (await request<{state:PilotState}>(path,{method:'POST',body:JSON.stringify(body)},crypto.randomUUID())).state}
    catch(error){
      if(!networkFailure(error))throw error
      queueOfflineAction('PILOT_API',{actionType,path,body},clientSession()?.sailingId)
      return local()
    }
  }
  return local()
}

export const clientLaunchPulse=(actorId:string)=>remoteOrLocal('FINAL_PULSE_LAUNCH','/pulse/launch',{},()=>launchFinalPulse(actorId))
export const clientSubmitPulse=(passengerId:string,ratings:Record<string,number>)=>remoteOrLocal('FINAL_PULSE_SUBMIT','/pulse/submit',{ratings},()=>submitPulse(passengerId,ratings))
export const clientRecognizeCrew=(passengerId:string,crewId:string,reasons:string[])=>remoteOrLocal('CREW_RECOGNITION','/recognitions',{crewId,reasons},()=>recognizeCrew(passengerId,crewId,reasons))
export const clientSendAffirmation=(fromId:string,toId:string,label:string)=>remoteOrLocal('PASSENGER_AFFIRMATION','/affirmations',{toId,label},()=>sendAffirmation(fromId,toId,label))
export const clientRespondAffirmation=(affirmationId:string,recipientId:string,status:'acknowledged'|'ignored')=>remoteOrLocal('AFFIRMATION_RESPONSE',`/affirmations/${affirmationId}/respond`,{status},()=>respondAffirmation(affirmationId,recipientId,status))
export const clientProposeMeeting=(fromId:string,toId:string,place:string)=>remoteOrLocal('PUBLIC_MEETING_PROPOSAL','/meeting-proposals',{toId,place},()=>proposeMeeting(fromId,toId,place))
export const clientUpdatePrize=(actorId:string,prize:PrizeConfig)=>remoteOrLocal('PRIZE_CONFIG','/prize/config',prize as unknown as Record<string,unknown>,()=>updatePrize(actorId,prize))
export const clientDrawWinners=(actorId:string)=>remoteOrLocal('PRIZE_DRAW','/prize/draw',{},()=>drawPulseWinners(actorId))

export async function clientUpdateInterests(interests:string[]){
  if(!remoteToken()) return null
  return request<{directory:RemoteDirectory}>('/interests',{method:'POST',body:JSON.stringify({interests})},crypto.randomUUID())
}
export async function clientSetNearbyVisibility(nearbyVisible:boolean){
  if(!remoteToken()) return null
  return request<{directory:RemoteDirectory}>('/visibility',{method:'POST',body:JSON.stringify({nearbyVisible})},crypto.randomUUID())
}
export async function clientSubmitServiceIssue(departmentId:string|null,category:string){
  if(!remoteToken()) throw new Error('Ship API unavailable. Queue this request until the onboard connection returns.')
  return request<{issue:{id:string;status:string;submitted_at:string}}>('/service-issues',{method:'POST',body:JSON.stringify({departmentId,category})},crypto.randomUUID())
}
export async function clientSubmitExperiencePulse(departmentId:string,score:number,context='contextual'){
  if(!remoteToken()) throw new Error('Ship API unavailable.')
  return request<{ok:boolean}>('/experience-pulse',{method:'POST',body:JSON.stringify({departmentId,score,context})},crypto.randomUUID())
}
export async function clientTrackCommerce(event:{activityId?:string;eventType:string;amount?:number;currency?:string;attributable?:boolean}){
  if(!remoteToken()) return null
  return request<{ok:boolean}>('/commerce-events',{method:'POST',body:JSON.stringify(event)},crypto.randomUUID())
}

export const clientReset=async()=>{
  if(remoteToken()){
    try{return (await request<{state:PilotState}>('/admin/reset',{method:'POST',body:'{}'},crypto.randomUUID())).state}catch(error){if(!networkFailure(error))throw error}
  }
  return resetPilotState()
}

export async function clientLoadStaffOverview():Promise<StaffOverview>{
  if(!remoteToken()) throw new Error('Shared pilot API required for staff dashboards.')
  return (await request<{overview:StaffOverview}>('/staff/overview')).overview
}
export async function clientCreatePromotion(input:{title:string;category:string;message:string;incentive?:string;targetInterests?:string[];status?:string}){
  return request<{promotion:Promotion}>('/promotions',{method:'POST',body:JSON.stringify(input)},crypto.randomUUID())
}
export async function clientSetPromotionStatus(id:string,status:'draft'|'scheduled'|'live'|'paused'|'ended'){
  return request<{promotion:Promotion}>(`/promotions/${id}/status`,{method:'POST',body:JSON.stringify({status})},crypto.randomUUID())
}
export async function clientUpdateServiceIssueStatus(id:string,status:'acknowledged'|'assigned'|'resolved'|'closed',options:{assigneeId?:string;resolutionCode?:string}={}){
  return request<{issue:{id:string;status:string}}>(`/service-issues/${id}/status`,{method:'POST',body:JSON.stringify({status,...options})},crypto.randomUUID())
}
export async function clientTrackPromotion(id:string,eventType:'impression'|'open'|'click'|'booking'|'purchase',amount?:number){
  if(!remoteToken()) return null
  return request<{ok:boolean}>(`/promotions/${id}/event`,{method:'POST',body:JSON.stringify({eventType,amount})},crypto.randomUUID())
}

export async function clientLoadParticipationCampaigns(){
  if(!remoteToken()) return [] as ParticipationCampaign[]
  return (await request<{campaigns:ParticipationCampaign[]}>('/participation/campaigns')).campaigns
}
export async function clientCreateParticipationCampaign(input:{title:string;message:string;campaignType:string;prompt?:string;options?:string[];correctOption?:string;showLiveResults?:boolean;targetInterests?:string[];targetAgeBands?:string[];noPurchaseRequired?:boolean;winnerCount?:number;adultPrize?:string;alternatePrize?:string;status?:string}){
  return request<{campaign:ParticipationCampaign}>('/participation/campaigns',{method:'POST',body:JSON.stringify(input)},crypto.randomUUID())
}
export async function clientSetParticipationStatus(id:string,status:'draft'|'scheduled'|'live'|'closed'|'ended'){
  return request<{campaign:ParticipationCampaign}>(`/participation/campaigns/${id}/status`,{method:'POST',body:JSON.stringify({status})},crypto.randomUUID())
}
export async function clientEnterParticipation(id:string,response?:string,source?:'tap'|'qr'|'check_in'){
  return request<{campaign:ParticipationCampaign;entry:{id:string;campaignId:string;entryCode:string;enteredAt:string;qualified:boolean}}>(`/participation/campaigns/${id}/enter`,{method:'POST',body:JSON.stringify({response,source})},crypto.randomUUID())
}
export async function clientDrawParticipation(id:string){
  return request<{draw:Array<{passenger_account_id:string;prize:string;rank:number}>;campaigns:ParticipationCampaign[]}>(`/participation/campaigns/${id}/draw`,{method:'POST',body:'{}'},crypto.randomUUID())
}
export async function clientLoadIntegrations(){
  return (await request<{integrations:IntegrationConnector[]}>('/integrations')).integrations
}
export async function clientLoadMyServiceIssues(){
  if(!remoteToken()) return [] as MyServiceIssue[]
  return (await request<{issues:MyServiceIssue[]}>('/service-issues/mine')).issues
}
export async function clientPostRecoveryPulse(id:string,score:number){
  return request<{ok:boolean}>(`/service-issues/${id}/post-recovery`,{method:'POST',body:JSON.stringify({score})},crypto.randomUUID())
}
