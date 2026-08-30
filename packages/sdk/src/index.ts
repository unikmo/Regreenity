export type Feature = 'interests'|'meetups'|'vibes'|'crew-recognition'|'event-feedback'|'notifications'|'commerce'
export type AgeBand = 'adult'|'minor'
export type Connectivity = 'online'|'ship-local'|'offline'

export interface CruiseSession {
  sessionToken: string
  tenantRef: string
  sailingRef: string
  shipRef: string
  guestRef: string
  householdRef?: string
  ageBand: AgeBand
  locale: string
  expiresAt: string
  features: Feature[]
}

export interface CruiseEvent { id:string; title:string; startsAt:string; venue:string; category:string; capacity?:number }
export interface Meetup { id:string; interestId:string; title:string; startsAt:string; venue:string; visibleMembers:number; joined:boolean }
export interface PurchaseIntent { productId:string; category:string; attributionRef:string; sourceFeature:Feature }
export interface PurchaseOutcome { attributionRef:string; status:'confirmed'|'cancelled'|'refunded'; value:number; currency:string }
export interface FaceMatchResult { status:'recognized'|'not-recognized'|'ineligible'; receiverToken?:string; reason?:string }
export interface StructuredFeedback { eventId:string; score:1|2|3|4|5; responseIds:string[] }

export type Action =
  | { type:'interests.updated'; interests:string[] }
  | { type:'meetup.joined'|'meetup.left'; meetupId:string; revealIdentity:boolean }
  | { type:'vibe.sent'; receiverToken:string; vibeId:string }
  | { type:'crew.recognized'; crewToken:string; reasonIds:string[] }
  | { type:'event.feedback'; feedback:StructuredFeedback }
  | { type:'notification.preference'; enabled:boolean }
  | { type:'purchase.outcome'; outcome:PurchaseOutcome }

export interface ActionEnvelope {
  schemaVersion:1; idempotencyKey:string; createdAt:string; expiresAt:string
  sailingRef:string; guestRef:string; action:Action
}

export interface HostAdapter {
  getSession():Promise<CruiseSession>
  getConnectivity():Promise<Connectivity>
  listEvents(session:CruiseSession):Promise<CruiseEvent[]>
  listMeetups(session:CruiseSession):Promise<Meetup[]>
  submitAction(session:CruiseSession,envelope:ActionEnvelope):Promise<{accepted:boolean; duplicate?:boolean}>
  matchPassenger(session:CruiseSession,imageBytes:Uint8Array):Promise<FaceMatchResult>
  matchCrew(session:CruiseSession,imageBytes:Uint8Array):Promise<FaceMatchResult>
  scheduleNotification(session:CruiseSession,input:{id:string;title:string;body:string;deliverAt:string}):Promise<void>
  openPurchase(session:CruiseSession,intent:PurchaseIntent):Promise<void>
}

export interface QueueStore { read():Promise<ActionEnvelope[]>; write(items:ActionEnvelope[]):Promise<void> }

export class MemoryQueueStore implements QueueStore {
  private items:ActionEnvelope[]=[]
  async read(){ return structuredClone(this.items) }
  async write(items:ActionEnvelope[]){ this.items=structuredClone(items) }
}

export class HttpHostAdapter implements HostAdapter {
  private baseUrl:string
  private tokenProvider:()=>Promise<string>
  constructor(input:{baseUrl:string;tokenProvider:()=>Promise<string>}){this.baseUrl=input.baseUrl.replace(/\/$/,'');this.tokenProvider=input.tokenProvider}
  private async request<T>(path:string,init:RequestInit={}):Promise<T>{
    const token=await this.tokenProvider()
    const response=await fetch(`${this.baseUrl}${path}`,{...init,headers:{Authorization:`Bearer ${token}`,...init.headers}})
    if(!response.ok)throw new CruiseConnectError(`host_${response.status}`)
    return response.status===204?undefined as T:await response.json() as T
  }
  async getSession(){return this.request<CruiseSession>('/session')}
  async getConnectivity(){return typeof navigator!=='undefined'&&!navigator.onLine?'offline':'online' as Connectivity}
  async listEvents(session:CruiseSession){return this.request<CruiseEvent[]>(`/sailings/${encodeURIComponent(session.sailingRef)}/events`)}
  async listMeetups(session:CruiseSession){return this.request<Meetup[]>(`/sailings/${encodeURIComponent(session.sailingRef)}/meetups`)}
  async submitAction(_session:CruiseSession,envelope:ActionEnvelope){return this.request<{accepted:boolean;duplicate?:boolean}>('/actions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':envelope.idempotencyKey},body:JSON.stringify(envelope)})}
  async matchPassenger(_session:CruiseSession,imageBytes:Uint8Array){return this.request<FaceMatchResult>('/recognition/passenger-match',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:imageBytes as BodyInit})}
  async matchCrew(_session:CruiseSession,imageBytes:Uint8Array){return this.request<FaceMatchResult>('/recognition/crew-match',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:imageBytes as BodyInit})}
  async scheduleNotification(_session:CruiseSession,input:{id:string;title:string;body:string;deliverAt:string}){await this.request<void>('/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})}
  async openPurchase(_session:CruiseSession,intent:PurchaseIntent){await this.request<void>('/purchase-intents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(intent)})}
}

export class LocalStorageQueueStore implements QueueStore {
  private key:string
  constructor(key='cruiseconnect:queue:v1'){this.key=key}
  async read(){ try{return JSON.parse(localStorage.getItem(this.key)||'[]') as ActionEnvelope[]}catch{return[]} }
  async write(items:ActionEnvelope[]){ localStorage.setItem(this.key,JSON.stringify(items)) }
}

export class CruiseConnectError extends Error {
  public code:string
  constructor(code:string,message=code){super(message);this.code=code;this.name='CruiseConnectError'}
}

const uuid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`
const addHours=(iso:string,hours:number)=>new Date(new Date(iso).getTime()+hours*3600000).toISOString()

export class CruiseConnectClient {
  private session?:CruiseSession
  private host:HostAdapter
  private store:QueueStore
  private queueLimit:number
  constructor(host:HostAdapter,store:QueueStore=new MemoryQueueStore(),queueLimit=500){this.host=host;this.store=store;this.queueLimit=queueLimit}

  async initialize(){
    const session=await this.host.getSession()
    if(new Date(session.expiresAt)<=new Date())throw new CruiseConnectError('session_expired')
    this.session=session
    await this.flush()
    return session
  }
  private require(feature:Feature){
    if(!this.session)throw new CruiseConnectError('not_initialized')
    if(!this.session.features.includes(feature))throw new CruiseConnectError('feature_disabled')
    return this.session
  }
  async events(){return this.host.listEvents(this.require('event-feedback'))}
  async meetups(){return this.host.listMeetups(this.require('meetups'))}
  async updateInterests(interests:string[]){
    const clean=[...new Set(interests.map(x=>x.trim()).filter(Boolean))].slice(0,12)
    return this.dispatch('interests',{type:'interests.updated',interests:clean})
  }
  async joinMeetup(meetupId:string,revealIdentity=false){return this.dispatch('meetups',{type:'meetup.joined',meetupId,revealIdentity})}
  async leaveMeetup(meetupId:string){return this.dispatch('meetups',{type:'meetup.left',meetupId,revealIdentity:false})}
  async identifyPassenger(imageBytes:Uint8Array){
    const session=this.require('vibes')
    if(session.ageBand==='minor')return {status:'ineligible',reason:'minors_excluded'} as FaceMatchResult
    const result=await this.host.matchPassenger(session,imageBytes)
    imageBytes.fill(0)
    return result
  }
  async sendVibe(receiverToken:string,vibeId:string){return this.dispatch('vibes',{type:'vibe.sent',receiverToken,vibeId})}
  async identifyCrew(imageBytes:Uint8Array){const result=await this.host.matchCrew(this.require('crew-recognition'),imageBytes);imageBytes.fill(0);return result}
  async recognizeCrew(crewToken:string,reasonIds:string[]){return this.dispatch('crew-recognition',{type:'crew.recognized',crewToken,reasonIds:[...new Set(reasonIds)].slice(0,5)})}
  async submitEventFeedback(feedback:StructuredFeedback){
    if(feedback.responseIds.length>5)throw new CruiseConnectError('too_many_responses')
    return this.dispatch('event-feedback',{type:'event.feedback',feedback})
  }
  async setNotifications(enabled:boolean){return this.dispatch('notifications',{type:'notification.preference',enabled})}
  async notify(id:string,title:string,body:string,deliverAt:string){return this.host.scheduleNotification(this.require('notifications'),{id,title,body,deliverAt})}
  async purchase(productId:string,category:string,sourceFeature:Feature='commerce'){
    const session=this.require('commerce'), attributionRef=uuid()
    await this.host.openPurchase(session,{productId,category,attributionRef,sourceFeature})
    return attributionRef
  }
  async recordPurchase(outcome:PurchaseOutcome){return this.dispatch('commerce',{type:'purchase.outcome',outcome})}
  private async dispatch(feature:Feature,action:Action){
    const session=this.require(feature), now=new Date().toISOString()
    const envelope:ActionEnvelope={schemaVersion:1,idempotencyKey:uuid(),createdAt:now,expiresAt:addHours(now,72),sailingRef:session.sailingRef,guestRef:session.guestRef,action}
    if(await this.host.getConnectivity()==='offline'){await this.enqueue(envelope);return {accepted:true,queued:true,idempotencyKey:envelope.idempotencyKey}}
    try{const result=await this.host.submitAction(session,envelope);return {...result,queued:false,idempotencyKey:envelope.idempotencyKey}}
    catch{await this.enqueue(envelope);return {accepted:true,queued:true,idempotencyKey:envelope.idempotencyKey}}
  }
  private async enqueue(envelope:ActionEnvelope){
    const queue=(await this.store.read()).filter(x=>new Date(x.expiresAt)>new Date())
    if(queue.length>=this.queueLimit)throw new CruiseConnectError('queue_full')
    if(!queue.some(x=>x.idempotencyKey===envelope.idempotencyKey))queue.push(envelope)
    await this.store.write(queue)
  }
  async flush(){
    if(!this.session||await this.host.getConnectivity()==='offline')return {sent:0,remaining:(await this.store.read()).length}
    const pending=await this.store.read(), remaining:ActionEnvelope[]=[];let sent=0
    for(const item of pending){
      if(new Date(item.expiresAt)<=new Date()||item.sailingRef!==this.session.sailingRef)continue
      try{const result=await this.host.submitAction(this.session,item);if(result.accepted)sent++;else remaining.push(item)}catch{remaining.push(item)}
    }
    await this.store.write(remaining)
    return {sent,remaining:remaining.length}
  }
  async queued(){return (await this.store.read()).length}
}
