# Tiny Stack VM

![tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)
![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sahrudinn04-dotcom/makefun-tiny-stack-vm/rank.svg)
![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sahrudinn04-dotcom/makefun-tiny-stack-vm/reward.svg)

An entry for the make.fun bounty [Build a tiny stack virtual machine](https://make.fun/bounty/tiny-stack-vm-01-run-20261122).

Sign up for make.fun through my referral link: https://make.fun/r/2c51b8pr

## What it is

A single-file interpreter (`main.ts`, Node 22, no dependencies) for make.fun's
tiny stack ISA: 32-bit wrapping integers, a 256-value data stack, a 64-deep
call stack, 256 words of memory, input/output, and all ten traps with their
own exit codes, plus the step and output limits. It runs a whole set of 40
instances in one go and writes each answer as `stdout.bin` + `exit.txt`.

Run it locally on the kit's practice set:

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```
