import {NextRequest,NextResponse} from 'next/server';
import {assessCase, type CaseInput} from '@/lib/risk';
export const runtime='nodejs';
export async function POST(req:NextRequest){
  try {
    if(Number(req.headers.get('content-length')||0)>20000)return NextResponse.json({error:'Request too large'},{status:413});
    const raw=await req.text();
    if(raw.length>20000)return NextResponse.json({error:'Request too large'},{status:413});
    const input=JSON.parse(raw);
    if(!input||typeof input!=='object'||Array.isArray(input))return NextResponse.json({error:'Invalid case data'},{status:400});
    // The API only computes governed risk. It never triggers a banking action.
    return NextResponse.json({assessment:assessCase(input as CaseInput),integration:{n8n:'NOT_CONNECTED',live_ai:'NOT_CONNECTED',persistence:'BROWSER_ONLY'}});
  } catch {return NextResponse.json({error:'Invalid request; assessment not performed'},{status:400})}
}
