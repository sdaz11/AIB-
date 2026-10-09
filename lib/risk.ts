/** Faithful TypeScript port of risk_engine.py scoring bands and signal weights.
 * This is NOT a Python runtime and DOES NOT implement the full Python evidence
 * validator, real LLM agents, n8n human callbacks, or a banking integration.
 */
export type Risk = 'LOW'|'MEDIUM'|'HIGH'|'UNKNOWN';
export type CaseInput = {
  case_id?:string; customer_name:string; home_city:string; location:string;
  average_transaction:number; amount:number; transaction_time:string;
  device_id:string; device_status:'Known'|'New'; beneficiary_status:'Existing'|'New';
  failed_auth_attempts:number; usual_start_hour:number; usual_end_hour:number;
  channel?:string; merchant_category?:string; alert_reason?:string;
};
export type Signal = {name:string; evidence:string; points:number};
export type Assessment = {
  case_id:string; input:CaseInput; risk_score:number|null; risk_level:Risk;
  risk_score_valid:boolean; recommended_action:string; governance_route:string;
  human_review:boolean; escalation:boolean; amount_ratio:number|null;
  signals:Signal[]; validation_issues:string[]; policy_version:string;
  evidence_gate_status:'PASS'|'FAIL_SAFE'; irreversible_action_executed:false;
};
export const POLICY_VERSION='AEGIS-RISK-POLICY-2.0';
const INDIAN_CITIES=new Set(['pune','bengaluru','bangalore','mumbai','delhi','new delhi','chennai','hyderabad','kolkata','ahmedabad','jaipur']);
function outsideHours(hour:number,start:number,end:number){
  if (start===end)return false;
  if(start<end)return hour<start||hour>=end;
  return hour>=end&&hour<start;
}
export function assessCase(input:CaseInput):Assessment {
  const problems:string[]=[];
  for(const field of ['customer_name','home_city','location','transaction_time','device_id'] as const){
    if(!String(input[field]??'').trim())problems.push(`${field}: required`);
  }
  if(!Number.isFinite(input.amount)||input.amount<=0)problems.push('amount: must be positive');
  if(!Number.isFinite(input.average_transaction)||input.average_transaction<=0)problems.push('average_transaction: must be positive');
  if(!Number.isSafeInteger(input.failed_auth_attempts)||input.failed_auth_attempts<0)problems.push('failed_auth_attempts: invalid');
  for(const h of ['usual_start_hour','usual_end_hour'] as const){if(!Number.isInteger(input[h])||input[h]<0||input[h]>23)problems.push(`${h}: 0–23 expected`)}
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.transaction_time))problems.push('transaction_time: HH:MM expected');
  if(!['Known','New'].includes(input.device_status))problems.push('device_status: invalid');
  if(!['Existing','New'].includes(input.beneficiary_status))problems.push('beneficiary_status: invalid');
  const id=(input.case_id||`CUSTOM-CASE-${crypto.randomUUID().slice(0,8)}`).toUpperCase();
  const amount_ratio=input.average_transaction>0?Number((input.amount/input.average_transaction).toFixed(4)):null;
  const base={case_id:id,input:{...input,case_id:id}, policy_version:POLICY_VERSION, irreversible_action_executed:false as const};
  if(problems.length){return {...base,risk_score:null,risk_score_valid:false,risk_level:'UNKNOWN',recommended_action:'MANUAL REVIEW',governance_route:'MANUAL REVIEW FAIL-SAFE ROUTE',human_review:true,escalation:true,amount_ratio,signals:[{name:'Evidence quality fail-safe',evidence:problems.join('; '),points:0}],validation_issues:problems,evidence_gate_status:'FAIL_SAFE'}}
  const signals:Signal[]=[];
  const add=(name:string,evidence:string,points:number)=>signals.push({name,evidence,points});
  const ratio=amount_ratio!;
  if(ratio>=10)add('Extreme transaction value anomaly',`${ratio.toFixed(1)}× customer average`,30);
  else if(ratio>=5)add('High transaction value anomaly',`${ratio.toFixed(1)}× customer average`,25);
  else if(ratio>=3)add('Elevated transaction value',`${ratio.toFixed(1)}× customer average`,15);
  else if(ratio>=1.5)add('Moderately elevated transaction value',`${ratio.toFixed(1)}× customer average`,5);
  if(input.location.trim().toLowerCase()!==input.home_city.trim().toLowerCase()){
    const foreign=!INDIAN_CITIES.has(input.location.trim().toLowerCase());
    add(foreign?'Foreign geographic anomaly':'Domestic geographic deviation',foreign?`Foreign transaction: ${input.location}`:`Home city: ${input.home_city}; transaction: ${input.location}`,foreign?20:15);
  }
  if(input.device_status==='New')add('New device detected',input.device_id,15);
  if(input.beneficiary_status==='New')add('New beneficiary','Beneficiary not previously established',15);
  if(input.failed_auth_attempts>=3)add('Repeated authentication failures',`${input.failed_auth_attempts} failed attempts`,20);
  else if(input.failed_auth_attempts>0)add('Authentication anomaly',`${input.failed_auth_attempts} failed attempt(s)`,8);
  if(outsideHours(Number(input.transaction_time.slice(0,2)),input.usual_start_hour,input.usual_end_hour))add('Unusual transaction time',`Transaction occurred at ${input.transaction_time}`,10);
  const score=Math.min(signals.reduce((s,x)=>s+x.points,0),100);
  const risk_level:Risk=score>=70?'HIGH':score>=30?'MEDIUM':'LOW';
  const config={HIGH:{recommended_action:'HOLD AND REVIEW',governance_route:'HUMAN REVIEW + ESCALATION ROUTE',human_review:true,escalation:true},MEDIUM:{recommended_action:'VERIFY CUSTOMER',governance_route:'HUMAN VERIFICATION ROUTE',human_review:true,escalation:false},LOW:{recommended_action:'PROCEED',governance_route:'AUTONOMOUS LOW-RISK ROUTE',human_review:false,escalation:false}}[risk_level as 'HIGH'|'MEDIUM'|'LOW'];
  return {...base,risk_score:score,risk_score_valid:true,risk_level,...config,amount_ratio:ratio,signals,validation_issues:[],evidence_gate_status:'PASS'};
}
export const SAMPLE_CASES:CaseInput[]=[
  {case_id:'CASE-001',customer_name:'Arjun Mehta',home_city:'Pune',location:'Pune',average_transaction:5200,amount:4200,transaction_time:'18:30',device_id:'IPHONE-15',device_status:'Known',beneficiary_status:'Existing',failed_auth_attempts:0,usual_start_hour:8,usual_end_hour:22,channel:'Mobile Banking',merchant_category:'E-Commerce'},
  {case_id:'CASE-002',customer_name:'Neha Kapoor',home_city:'Pune',location:'Bengaluru',average_transaction:9000,amount:48000,transaction_time:'22:30',device_id:'SAMSUNG-S24',device_status:'Known',beneficiary_status:'Existing',failed_auth_attempts:0,usual_start_hour:7,usual_end_hour:23,channel:'Mobile Banking',merchant_category:'Retail Purchase'},
  {case_id:'CASE-003',customer_name:'Rohan Malhotra',home_city:'Pune',location:'Singapore',average_transaction:6500,amount:175000,transaction_time:'02:13',device_id:'ANDROID-X91',device_status:'New',beneficiary_status:'New',failed_auth_attempts:5,usual_start_hour:8,usual_end_hour:22,channel:'Mobile Banking',merchant_category:'Bank Transfer'}
];
