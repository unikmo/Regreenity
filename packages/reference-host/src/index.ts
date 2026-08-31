import type { ActionEnvelope, Connectivity, CruiseEvent, CruiseSession, FaceMatchResult, HostAdapter, Meetup, PurchaseIntent, VConnectRequest, VConnectUpdate } from '../../sdk/src/index.ts'

export class ReferenceCruiseHost implements HostAdapter {
  connectivity:Connectivity='online'
  readonly actions:ActionEnvelope[]=[]
  readonly notifications:{id:string;title:string;body:string;deliverAt:string}[]=[]
  readonly purchases:PurchaseIntent[]=[]
  private seen=new Set<string>()
  private actionSailingDays=new Map<string,string>()
  private readonly sailingTimezone='Europe/Rome'
  private session:CruiseSession={sessionToken:'sandbox-session',tenantRef:'oceanic',sailingRef:'OC-2026-104',shipRef:'OCEANIC-AURORA',guestRef:'G-1042',householdRef:'H-301',ageBand:'adult',locale:'en',expiresAt:'2099-01-01T00:00:00.000Z',features:['interests','meetups','vibes','vconnect','crew-recognition','event-feedback','notifications','commerce']}
  private eventRows:CruiseEvent[]=[
    {id:'evt-wine',title:'Mediterranean wine tasting',startsAt:'2026-09-01T17:30:00+02:00',venue:'Vintages',category:'wine',capacity:24},
    {id:'evt-family',title:'Family deck games',startsAt:'2026-09-01T15:00:00+02:00',venue:'Sports deck',category:'family',capacity:40},
    {id:'evt-jazz',title:'Sunset jazz session',startsAt:'2026-09-01T20:00:00+02:00',venue:'Atrium',category:'music',capacity:80},
  ]
  private meetupRows:Meetup[]=[
    {id:'meet-wine',interestId:'wine',title:'Wine lovers hello',startsAt:'2026-09-01T10:30:00+02:00',venue:'Atrium café',visibleMembers:6,joined:false},
    {id:'meet-photo',interestId:'photography',title:'Golden-hour photographers',startsAt:'2026-09-01T18:15:00+02:00',venue:'Deck 12 port side',visibleMembers:4,joined:false},
  ]
  async getSession(){return structuredClone(this.session)}
  async getConnectivity(){return this.connectivity}
  async listEvents(){return structuredClone(this.eventRows)}
  async listMeetups(){return structuredClone(this.meetupRows)}
  async listVConnectInbox():Promise<VConnectRequest[]>{return []}
  async listVConnectUpdates():Promise<VConnectUpdate[]>{return []}
  private sailingLocalDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:this.sailingTimezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  async submitAction(_session:CruiseSession,envelope:ActionEnvelope){
    if(this.seen.has(envelope.idempotencyKey))return {accepted:true,duplicate:true}
    if(envelope.sailingRef!==this.session.sailingRef)throw new Error('wrong_sailing')
    if(envelope.action.type==='vibe.sent'&&envelope.action.receiverToken==='same-household')throw new Error('household_excluded')
    const sailingDay=this.sailingLocalDay()
    const sameGuestDay=this.actions.filter(item=>item.guestRef===envelope.guestRef&&this.actionSailingDays.get(item.idempotencyKey)===sailingDay)
    if(envelope.action.type==='vibe.sent'&&sameGuestDay.filter(item=>item.action.type==='vibe.sent').length>=5)return {accepted:false,rejectionReason:'daily_vibe_limit'}
    if(envelope.action.type==='vconnect.requested'&&sameGuestDay.filter(item=>item.action.type==='vconnect.requested').length>=1)return {accepted:false,rejectionReason:'daily_vconnect_limit'}
    this.seen.add(envelope.idempotencyKey);this.actionSailingDays.set(envelope.idempotencyKey,sailingDay);this.actions.push(structuredClone(envelope))
    const action=envelope.action
    if(action.type==='meetup.joined')this.meetupRows=this.meetupRows.map(m=>m.id===action.meetupId?{...m,joined:true,visibleMembers:m.visibleMembers+1}:m)
    return {accepted:true}
  }
  async matchPassenger(session:CruiseSession,imageBytes:Uint8Array):Promise<FaceMatchResult>{
    if(session.ageBand==='minor')return {status:'ineligible',reason:'minors_excluded'}
    return imageBytes.byteLength<4?{status:'not-recognized',reason:'image_quality'}:{status:'recognized',receiverToken:'adult-same-sailing-token'}
  }
  async matchCrew(_session:CruiseSession,imageBytes:Uint8Array):Promise<FaceMatchResult>{return imageBytes.byteLength<4?{status:'not-recognized'}:{status:'recognized',receiverToken:'crew-roster-token'}}
  async scheduleNotification(_session:CruiseSession,input:{id:string;title:string;body:string;deliverAt:string}){this.notifications.push(input)}
  async openPurchase(_session:CruiseSession,intent:PurchaseIntent){this.purchases.push(intent)}
  setOffline(value:boolean){this.connectivity=value?'offline':'online'}
  setMinor(value:boolean){this.session={...this.session,ageBand:value?'minor':'adult'}}
  reset(){this.actions.length=0;this.notifications.length=0;this.purchases.length=0;this.seen.clear();this.actionSailingDays.clear();this.connectivity='online';this.setMinor(false)}
}
