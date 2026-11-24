// Tiny stack VM for make.fun's tiny-stack-vm-01 ISA (see the kit's ISA.md).
// Runs every /input/<id>/program.bin on /input/<id>/input.bin and writes
// /output/<id>/stdout.bin + /output/<id>/exit.txt for the whole set.
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const enc = new TextEncoder();
// Opcode table: entry = 1 + (immediate bytes << 4) + (pops << 2) + pushes.
// 0 means the byte names no opcode.
const T = new Uint8Array(256);
const put = (v, ...ops) => { for (const o of ops) T[o] = v; };
put(1, 0, 0x34); // HALT, RET
put(18, 1); // PUSH8
put(66, 2); // PUSH32
put(5, 3, 0x50, 0x51, 0x53); // POP, PRINT, PUTC, EXIT
put(7, 4); // DUP
put(11, 5); // SWAP
put(12, 6); // OVER
put(16, 7); // ROT
put(10, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x18, 0x19, 0x1a, 0x1c, 0x1d, 0x1e, 0x20, 0x21, 0x22); // binary ops
put(6, 0x17, 0x1b, 0x40); // NEG, NOT, LOAD
put(33, 0x30, 0x33); // JMP, CALL
put(37, 0x31, 0x32); // JZ, JNZ
put(9, 0x41); // STORE
put(2, 0x52); // IN

function run(p, inp) {
  const n = p.length;
  const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, csp = 0, olen = 0, ip = 0, pc = 0, steps = 0;
  const done = (code) => ({o: out.subarray(0, olen), c: code});
  for (;;) {
    if (steps === 1000000) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const op = p[pc], t = T[op];
    if (!t) return done(5);
    const v = t - 1, imm = v >> 4, pops = (v >> 2) & 3, pushes = v & 3;
    if (pc + imm >= n) return done(9);
    steps++;
    const next = pc + 1 + imm;
    if (sp < pops) return done(2);
    if (sp - pops + pushes > 256) return done(3);
    pc = next;
    switch (op) {
      case 0x00: return done(0);
      case 0x01: D[sp++] = (p[next - 1] << 24) >> 24; break;
      case 0x02: D[sp++] = p[next - 4] | (p[next - 3] << 8) | (p[next - 2] << 16) | (p[next - 1] << 24); break;
      case 0x03: sp--; break;
      case 0x04: D[sp] = D[sp - 1]; sp++; break;
      case 0x05: { const t0 = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t0; break; }
      case 0x06: D[sp] = D[sp - 2]; sp++; break;
      case 0x07: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 0x17: D[sp - 1] = -D[sp - 1] | 0; break;
      case 0x1b: D[sp - 1] = ~D[sp - 1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b = D[sp - 1], a = D[sp - 2];
        let r;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (!b) return done(4); r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
        else if (op === 0x14) { if (!b) return done(4); r = b === -1 ? 0 : (a % b) | 0; }
        else if (op === 0x15) { if (!b) return done(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 0x16) { if (!b) return done(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        D[sp - 2] = r; sp--;
        break;
      }
      case 0x30: case 0x31: case 0x32: {
        const rel = ((p[next - 2] | (p[next - 1] << 8)) << 16) >> 16;
        let take = op === 0x30;
        if (!take) { const v0 = D[--sp]; take = op === 0x31 ? v0 === 0 : v0 !== 0; }
        if (take) pc = next + rel;
        break;
      }
      case 0x33:
        if (csp === 64) return done(7);
        C[csp++] = next;
        pc = p[next - 2] | (p[next - 1] << 8);
        break;
      case 0x34:
        if (!csp) return done(8);
        pc = C[--csp];
        break;
      case 0x40: {
        const a = D[sp - 1];
        if (a < 0 || a > 255) return done(6);
        D[sp - 1] = M[a];
        break;
      }
      case 0x41: {
        const a = D[sp - 1], v0 = D[sp - 2];
        if (a < 0 || a > 255) return done(6);
        sp -= 2; M[a] = v0;
        break;
      }
      case 0x50: {
        const bs = enc.encode(String(D[sp - 1]));
        if (olen + bs.length > 65536) return done(11);
        sp--; out.set(bs, olen); olen += bs.length;
        break;
      }
      case 0x51:
        if (olen + 1 > 65536) return done(11);
        out[olen++] = D[--sp] & 255;
        break;
      case 0x52:
        D[sp++] = ip < inp.length ? inp[ip++] : -1;
        break;
      case 0x53:
        return done(D[--sp] & 255);
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
  mkdirSync(join(O, id), {recursive: true});
  writeFileSync(join(O, id, 'stdout.bin'), r.o);
  writeFileSync(join(O, id, 'exit.txt'), r.c + '\n');
}
