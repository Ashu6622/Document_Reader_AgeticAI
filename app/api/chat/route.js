import {NextResponse} from 'next/server'
import {generate} from '../llmSetup.js'

export async function POST(request) {
    
    try{
            const data = await request.json();
            // console.log("Data => ",data);
            const result = await generate(data);
            // console.log(result);
            return NextResponse.json({message:result});
    }
    catch(error){
        return NextResponse.json({message:error.message});
    }
}