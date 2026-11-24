import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const e=new TextEncoder,T=new Uint8Array(256),P=(v,...o)=>{for(const x of o)T[x]=v};
P(1,0,52);P(18,1);P(66,2);P(5,3,80,81,83);P(7,4);P(11,5);P(12,6);P(16,7);P(10,16,17,18,19,20,21,22,24,25,26,28,29,30,32,33,34);P(6,23,27,64);P(33,48,51);P(37,49,50);P(9,65);P(2,82);

function run(p,q){
const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
let s=0,c=0,l=0,i=0,k=0,t=0;
const d=x=>({o:o.subarray(0,l),c:x});
for(;;){
if(t===1e6)return d(10);
if(k<0||k>=n)return d(9);
const b=p[k],w=T[b];
if(!w)return d(5);
const v=w-1,m=v>>4,u=(v>>2)&3,g=v&3;
if(k+m>=n)return d(9);
t++;
const x=k+1+m;
if(s<u)return d(2);
if(s-u+g>256)return d(3);
k=x;
switch(b){
case 0:return d(0);
case 1:D[s++]=(p[x-1]<<24)>>24;break;
case 2:D[s++]=p[x-4]|p[x-3]<<8|p[x-2]<<16|p[x-1]<<24;break;
case 3:s--;break;
case 4:D[s]=D[s-1];s++;break;
case 5:{const a=D[s-1];D[s-1]=D[s-2];D[s-2]=a;break;}
case 6:D[s]=D[s-2];s++;break;
case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;}
case 23:D[s-1]=-D[s-1]|0;break;
case 27:D[s-1]=~D[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
const y=D[s-1],a=D[s-2];
let r;
if(b===16)r=a+y|0;
else if(b===17)r=a-y|0;
else if(b===18)r=Math.imul(a,y);
else if(b===19){if(!y)return d(4);r=a===-2147483648&&y===-1?a:a/y|0;}
else if(b===20){if(!y)return d(4);r=y===-1?0:a%y|0;}
else if(b===21){if(!y)return d(4);r=Math.floor((a>>>0)/(y>>>0))|0;}
else if(b===22){if(!y)return d(4);r=(a>>>0)%(y>>>0)|0;}
else if(b===24)r=a&y;
else if(b===25)r=a|y;
else if(b===26)r=a^y;
else if(b===28)r=a<<(y&31);
else if(b===29)r=a>>(y&31);
else if(b===30)r=a>>>(y&31)|0;
else if(b===32)r=a===y?1:0;
else if(b===33)r=a<y?1:0;
else r=(a>>>0)<(y>>>0)?1:0;
D[s-2]=r;s--;
break;}
case 48:case 49:case 50:{
const f=(p[x-2]|p[x-1]<<8)<<16>>16;
let z=b===48;
if(!z){const v0=D[--s];z=b===49?v0===0:v0!==0;}
if(z)k=x+f;
break;}
case 51:
if(c===64)return d(7);
C[c++]=x;
k=p[x-2]|p[x-1]<<8;
break;
case 52:
if(!c)return d(8);
k=C[--c];
break;
case 64:{
const a=D[s-1];
if(a<0||a>255)return d(6);
D[s-1]=M[a];
break;}
case 65:{
const a=D[s-1],v0=D[s-2];
if(a<0||a>255)return d(6);
s-=2;M[a]=v0;
break;}
case 80:{
const h=e.encode(String(D[s-1]));
if(l+h.length>65536)return d(11);
s--;o.set(h,l);l+=h.length;
break;}
case 81:
if(l+1>65536)return d(11);
o[l++]=D[--s]&255;
break;
case 82:D[s++]=i<q.length?q[i++]:-1;break;
case 83:return d(D[--s]&255);
    }
  }
}

const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
const r=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
mkdirSync(join(O,id),{recursive:true});
writeFileSync(join(O,id,'stdout.bin'),r.o);
writeFileSync(join(O,id,'exit.txt'),r.c+'\n');
}
