"use strict";(()=>{var C=String.raw`
@property --cg-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.cg {
  --ink: #1f2328; --mute: #6b7280; --faint: #a3a9b3; --line: #e7e9ee; --bg: #fff;
  --blue: #2563eb; --green: #16a34a; --amber: #d97706; --red: #dc2626; --violet: #7c3aed; --teal: #0d9488; --rose: #e11d48;
  font: 13px/1.45 -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 14px; overflow: hidden;
  position: relative; -webkit-font-smoothing: antialiased;
}
.cg * { box-sizing: border-box; }

/* header */
.cg-head { display: flex; align-items: center; gap: 12px; padding: 12px 16px 11px; position: relative; }
.cg-title { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.cg-goal { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cg-ver { color: var(--faint); font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cg-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cg-now { display: inline-flex; align-items: center; gap: 6px; color: var(--blue); font-size: 12px; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; min-width: 0; animation: cg-slide .35s cubic-bezier(.2,.8,.2,1) both; }
.cg-now i { flex: 0 0 6px; height: 6px; border-radius: 50%; background: var(--blue); animation: cg-blink 1s ease-in-out infinite; }
.cg-chip { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border-radius: 12px;
  font-size: 12px; font-weight: 500; white-space: nowrap; transition: background .3s, color .3s; }
.cg-chip i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.cg-chip.ok { background: #e9f7ee; color: var(--green); }
.cg-chip.bad { background: #fdecec; color: var(--red); }
.cg-chip.wait { background: #fff4e0; color: var(--amber); }
.cg-chip.run { background: #e8f0fe; color: var(--blue); }
.cg-chip.run i { animation: cg-blink 1s ease-in-out infinite; }
.cg-chip.mute { background: #f2f3f5; color: var(--mute); }
.cg-chip.soft { background: #f2f3f5; color: var(--mute); font-weight: 400; }
.cg-btn { height: 26px; padding: 0 12px; border-radius: 13px; border: 0; background: var(--ink); color: #fff; font: inherit;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: transform .15s, background .2s; }
.cg-btn:hover { background: #000; transform: translateY(-1px); }
.cg-bar { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: transparent; }
.cg-bar b { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #60a5fa, var(--blue));
  transition: width .6s cubic-bezier(.2,.8,.2,1), background .4s; }
.cg-bar.ok b { background: linear-gradient(90deg, #4ade80, var(--green)); }

/* approval in the card */
.cg-gate { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-top: 1px solid var(--line); background: #fffaf0;
  animation: cg-gate-in .28s cubic-bezier(.2,.8,.2,1) both; overflow: hidden; }
.cg-gate.leave { animation: cg-gate-out .26s ease both; }
.cg-gate.shake { animation: cg-shake .45s cubic-bezier(.36,.07,.19,.97) both; }
.cg-gate .who { font-size: 12.5px; color: var(--mute); white-space: nowrap; }
.cg-gate .who b { color: var(--ink); font-weight: 600; }
.cg-gate input { height: 28px; width: 150px; padding: 0 10px; border: 1px solid #e3e6eb; border-radius: 8px; font: inherit; font-size: 12.5px;
  outline: none; transition: border-color .2s, box-shadow .2s; background: #fff; }
.cg-gate input:focus { border-color: #93b4f5; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
.cg-gate .msg { color: var(--red); font-size: 12px; white-space: nowrap; }
.cg-gate .hash { margin-left: auto; color: var(--faint); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
.cg-gate .ok { display: inline-flex; align-items: center; gap: 6px; color: var(--green); font-weight: 600; font-size: 12.5px;
  animation: cg-pop .4s cubic-bezier(.2,1.6,.4,1) both; }
.cg-gate .ok svg { width: 14px; height: 14px; }
.cg-gate.done { background: #f2fbf5; }
.cg-btn.busy { opacity: .6; pointer-events: none; }

/* canvas */
.cg-canvas { position: relative; overflow: hidden; border-top: 1px solid var(--line); transition: height .45s cubic-bezier(.2,.8,.2,1);
  background-color: #fafbfc; background-image: radial-gradient(#e2e5ea 1px, transparent 1.3px); background-size: 16px 16px; }
.cg-stage { position: absolute; left: 0; top: 0; transform-origin: 0 0; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.cg-wait { display: none; position: absolute; inset: 0; align-items: center; justify-content: center; gap: 6px; }
.cg-canvas.empty .cg-wait { display: flex; }
.cg-wait i { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); opacity: .3; animation: cg-dots 1.2s infinite; }
.cg-wait i:nth-child(2) { animation-delay: .15s; } .cg-wait i:nth-child(3) { animation-delay: .3s; }
.cg-edges { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.cg-edges path { fill: none; stroke-width: 1.6; stroke-linecap: round; transition: stroke .4s, opacity .4s; }
.cg-edges .base { stroke: #cfd4dc; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .6s cubic-bezier(.4,0,.2,1), stroke .4s; }
.cg-edges .base.drawn { stroke-dashoffset: 0; }
.cg-edges .flow { stroke: var(--blue); stroke-width: 2; stroke-dasharray: 3 9; opacity: 0; animation: cg-flow .7s linear infinite; }
.cg-edges g.e-active .base { stroke: #93b4f5; }
.cg-edges g.e-active .flow { opacity: 1; }
.cg-edges g.e-done .base { stroke: #8fd1a6; }
.cg-edges g.e-skip .base { stroke: #dcdfe4; stroke-dasharray: .015 .015; }
.cg-edges g.e-bad .base { stroke: #f2a7a7; }
.cg-edges g.gone { opacity: 0; transition: opacity .3s; }

/* nodes */
.cg-slot { position: absolute; left: 0; top: 0; will-change: transform; }
.cg-node { position: relative; width: 184px; padding: 10px 11px 10px 10px; display: grid; grid-template-columns: 30px minmax(0, 1fr); column-gap: 9px;
  background: #fff; border: 1px solid #e3e6eb; border-radius: 12px; cursor: pointer;
  box-shadow: 0 1px 2px rgba(16,24,40,.04); transition: border-color .35s, background .35s, opacity .4s, filter .4s, box-shadow .2s, width .45s cubic-bezier(.2,.8,.2,1); }
.cg-node.leave { animation: cg-out .32s cubic-bezier(.4,0,.2,1) both; pointer-events: none; }
.cg-node:hover { box-shadow: 0 4px 14px rgba(16,24,40,.08); }
.cg-node.enter { animation: cg-in .5s cubic-bezier(.2,.8,.2,1) both; }
.cg-av { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; font-weight: 600; font-size: 14px;
  color: var(--c); background: var(--cbg); transition: filter .4s; }
.k-investigate { --c: var(--blue); --cbg: #e9f0ff; }
.k-blackbox { --c: var(--violet); --cbg: #f1eaff; }
.k-judge { --c: var(--amber); --cbg: #fff2dd; }
.k-write { --c: var(--teal); --cbg: #e3f5f2; }
.k-effect { --c: var(--rose); --cbg: #ffe9ee; }
.cg-body { min-width: 0; flex: 1; }
.cg-name { font-weight: 600; font-size: 13px; line-height: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cg-task { color: var(--mute); font-size: 11.5px; line-height: 16px; margin-top: 2px; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.cg-tags { position: absolute; top: -9px; left: 48px; display: flex; gap: 4px; }
.cg-tag { height: 18px; padding: 0 7px; border-radius: 9px; font-size: 11px; line-height: 16px; font-weight: 500;
  background: #fff; border: 1px solid currentColor; white-space: nowrap; }
.cg-tag.bb { color: var(--violet); }
.cg-tag.irrev { color: var(--rose); }
.cg-tag.deny { color: #fff; background: var(--red); border-color: var(--red); }
.cg-tag.reuse { color: var(--blue); }
.cg-tag.skip { color: var(--faint); }
.cg-tag.pop { animation: cg-pop .45s cubic-bezier(.2,1.6,.4,1) both; }
.cg-ok { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: var(--green);
  color: #fff; display: grid; place-items: center; box-shadow: 0 0 0 3px #fff; animation: cg-pop .5s cubic-bezier(.2,1.6,.4,1) both; }
.cg-ok svg { width: 11px; height: 11px; }
.cg-ok.reused { background: var(--blue); }
.cg-ok.fail { background: var(--red); }
.cg-act { margin-top: 6px; display: flex; align-items: center; gap: 6px; font-size: 11px; line-height: 16px; color: var(--blue); min-width: 0; }
.cg-act i { flex: 0 0 6px; height: 6px; border-radius: 50%; background: var(--blue); animation: cg-blink 1s ease-in-out infinite; }
.cg-act span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; animation: cg-slide .35s cubic-bezier(.2,.8,.2,1) both; }
.m-stalled .cg-act { color: var(--faint); }
.m-stalled .cg-act i { animation-play-state: paused; background: var(--faint); }
.cg-res { margin-top: 7px; display: inline-flex; align-items: center; height: 22px; padding: 0 9px; border-radius: 11px;
  font-size: 12px; font-weight: 600; animation: cg-pop .5s cubic-bezier(.2,1.6,.4,1) both; }
.cg-res.ok { background: #e9f7ee; color: var(--green); }
.cg-res.bad { background: #fdecec; color: var(--red); }
.cg-res.mute { background: #f2f3f5; color: var(--mute); }

/* node states */
.m-run .cg-node.s-pending { opacity: .5; }
.m-run .cg-node.s-pending .cg-av { filter: grayscale(1); }
.cg-node.s-running { border-color: transparent; }
.cg-node.s-running::before { content: ""; position: absolute; inset: -1.5px; border-radius: 13px; padding: 1.5px; pointer-events: none;
  background: conic-gradient(from var(--cg-a), rgba(37,99,235,0) 0 55%, #93c5fd 72%, #2563eb 88%, rgba(37,99,235,0) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  animation: cg-spin 1.4s linear infinite; }
.cg-node.s-running .cg-av { animation: cg-breathe 1.4s ease-in-out infinite; }
.m-stalled .cg-node.s-running::before { animation-play-state: paused; filter: grayscale(1); opacity: .5; }
.m-stalled .cg-node.s-running .cg-av, .m-stalled .cg-br em.started { animation-play-state: paused; }
.m-stalled .cg-edges .flow { animation-play-state: paused; opacity: .35; }
.cg-node.s-done { border-color: #bfe5cb; }
.cg-node.s-reused { border-color: #bcd3fb; }
.cg-node.s-skipped { border-style: dashed; opacity: .45; }
.cg-node.s-failed, .cg-node.denied { border-color: #f3a5a5; background: #fffafa; }
.cg-node.shake { animation: cg-shake .5s cubic-bezier(.36,.07,.19,.97) both; }

/* the black box: closed before it runs, opens as branches fork */
.cg-node.k-blackbox { border-style: dashed; border-color: #c9b5f5; }
.cg-node.k-blackbox.s-done, .cg-node.k-blackbox.s-reused { border-style: solid; }
.cg-bb { grid-column: 1 / -1; margin-top: 8px; border-radius: 8px; background: #f8f5ff; padding: 6px 8px; overflow: hidden; }
.cg-bb.closed { display: flex; align-items: center; gap: 5px; color: var(--violet); font-size: 11px; }
.cg-bb.closed i { width: 4px; height: 4px; border-radius: 50%; background: var(--violet); opacity: .3; animation: cg-dots 1.2s infinite; }
.cg-bb.closed i:nth-child(2) { animation-delay: .15s; } .cg-bb.closed i:nth-child(3) { animation-delay: .3s; }
.cg-bb.closed span { margin-left: 3px; }
.cg-br { display: flex; align-items: center; gap: 6px; font-size: 11px; line-height: 18px; color: #4b5563; white-space: nowrap; }
.cg-br span { overflow: hidden; text-overflow: ellipsis; }
.cg-br.enter { animation: cg-slide .45s cubic-bezier(.2,.8,.2,1) both; }
.cg-br em { flex: 0 0 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--violet); }
.cg-br em.started { border-color: #c4b5fd; border-top-color: var(--violet); animation: cg-rot .8s linear infinite; }
.cg-br em.finished { background: var(--violet); }
.cg-br em.interrupted { border-color: var(--faint); border-style: dashed; }
.cg-br.more { color: var(--faint); padding-left: 14px; }

/* the black box at run time: a Loop Forest group, branches fork out of the host */
.cg-node.group { width: 404px; display: flex; align-items: center; column-gap: 0; background: #fcfaff; }
.cg-host { position: relative; flex: 0 0 163px; display: grid; grid-template-columns: 30px minmax(0, 1fr); column-gap: 9px; }
.cg-fan { position: static; flex: 1 1 auto; min-width: 0; margin-left: 56px; padding: 7px 8px 7px 2px; display: flex; flex-direction: column;
  gap: 7px; overflow: hidden; }
.cg-fan-edges { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.cg-fan-edges path { fill: none; stroke-linecap: round; }
.cg-fan-edges .fb { stroke: #d6c6fb; stroke-width: 1.6; stroke-dasharray: 1; stroke-dashoffset: 1;
  transition: stroke-dashoffset .45s cubic-bezier(.4,0,.2,1), stroke .4s; }
.cg-fan-edges .fb.drawn { stroke-dashoffset: 0; }
.cg-fan-edges .b-finished .fb { stroke: #a78bfa; }
.cg-fan-edges .b-interrupted .fb { stroke: #d4d7dd; stroke-dasharray: .03 .03; }
.cg-fan-edges .ff { stroke: var(--violet); stroke-width: 2; stroke-dasharray: 3 9; opacity: 0; animation: cg-flow .7s linear infinite; }
.cg-fan-edges .b-started .ff { opacity: .85; }
.cg-fan-edges .fr { stroke: var(--violet); stroke-width: 4.5; stroke-dasharray: .2 1.3; stroke-dashoffset: .21; opacity: 0;
  filter: drop-shadow(0 0 3px rgba(124,58,237,.7)); }
.cg-fan-edges .fr.ret { animation: cg-ret .8s cubic-bezier(.45,0,.25,1) .1s both; }
.cg-fan-edges .fb.flash { animation: cg-edge-flash 1s ease-out both; }
.cg-ripple { position: absolute; left: 0; top: 0; width: 30px; height: 30px; border-radius: 9px; border: 2px solid var(--violet);
  pointer-events: none; opacity: 0; animation: cg-ripple .6s ease-out .85s forwards; }
.cg-lfb { position: relative; flex: 0 0 auto; width: 152px; display: grid; grid-template-columns: 22px minmax(0, 1fr); column-gap: 7px;
  align-items: center; padding: 6px 8px 6px 6px; background: #fff; border: 1px solid #e4dafb; border-radius: 10px; transition: border-color .35s, opacity .4s; }
.cg-lfb.enter { animation: cg-fork .5s cubic-bezier(.2,.8,.2,1) both; }
.cg-lfb.s-started { border-color: transparent; }
.cg-lfb.s-started::before { content: ""; position: absolute; inset: -1.5px; border-radius: 11px; padding: 1.5px; pointer-events: none;
  background: conic-gradient(from var(--cg-a), rgba(124,58,237,0) 0 55%, #c4b5fd 72%, #7c3aed 88%, rgba(124,58,237,0) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  animation: cg-spin 1.4s linear var(--ph, 0ms) infinite; }
.cg-lfb.s-finished { border-color: #cdb8fa; }
.cg-lfb.s-interrupted { border-style: dashed; border-color: #d4d7dd; opacity: .6; }
.cg-lfb-av { width: 22px; height: 22px; border-radius: 7px; display: grid; place-items: center; font-size: 12px; font-weight: 600;
  color: var(--violet); background: #f1eaff; }
.cg-lfb.s-interrupted .cg-lfb-av { filter: grayscale(1); }
.cg-lfb-body { min-width: 0; }
.cg-lfb-name { font-size: 12px; font-weight: 600; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cg-lfb-name em { font-style: normal; color: var(--blue); margin-right: 3px; font-weight: 500; }
.cg-lfb-sub { display: flex; align-items: center; gap: 5px; margin-top: 1px; font-size: 11px; line-height: 16px; color: var(--mute);
  white-space: nowrap; overflow: hidden; }
.cg-lfb-sub span { overflow: hidden; text-overflow: ellipsis; }
.cg-lfb-sub.act { color: var(--violet); }
.cg-lfb-sub.act i { flex: 0 0 5px; height: 5px; border-radius: 50%; background: var(--violet); animation: cg-blink 1s ease-in-out infinite; }
.cg-lfb-sub.act span { animation: cg-slide .35s cubic-bezier(.2,.8,.2,1) both; }
.m-stalled .cg-lfb.s-started::before, .m-stalled .cg-lfb-sub.act i, .m-stalled .cg-fan-edges .ff { animation-play-state: paused; }
.cg-lfb .find { height: 16px; padding: 0 6px; border-radius: 8px; font-weight: 600; font-size: 11px; line-height: 16px; }
.cg-lfb .find.ok { background: #e9f7ee; color: var(--green); }
.cg-lfb .find.warn { background: #fff4e0; color: var(--amber); }
.cg-lfb .find.pop { animation: cg-pop .45s cubic-bezier(.2,1.6,.4,1) .15s both; }
.cg-lfb-ok { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%; background: var(--violet); color: #fff;
  display: grid; place-items: center; box-shadow: 0 0 0 2px #fff; }
.cg-lfb-ok svg { width: 9px; height: 9px; }
.cg-lfb-ok.pop { animation: cg-pop .45s cubic-bezier(.2,1.6,.4,1) both; }
.cg-lfb-more { font-size: 11px; color: var(--faint); padding-left: 8px; }

/* condition label on an edge */
.cg-cond { position: absolute; transform: translate(-50%, -50%); height: 20px; padding: 0 8px; border-radius: 10px;
  background: #fff; border: 1px solid #e3e6eb; font-size: 11px; line-height: 18px; color: var(--mute); white-space: nowrap;
  transition: color .3s, border-color .3s, background .3s, opacity .4s; }
.cg-cond.on { color: var(--green); border-color: #a7dcb9; background: #f2fbf5; }
.cg-cond.off { opacity: .55; text-decoration: line-through; }
.cg-cond.gone { opacity: 0; }

/* footer: precheck problems, verification */
.cg-foot:empty { display: none; }
.cg-foot { border-top: 1px solid var(--line); padding: 10px 16px 12px; }
.cg-prob { display: flex; gap: 8px; align-items: baseline; font-size: 12.5px; padding: 3px 0; animation: cg-fade .4s both; }
.cg-prob::before { content: ""; flex: 0 0 6px; height: 6px; border-radius: 50%; background: var(--red); transform: translateY(-1px); }
.cg-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; }
.cg-checks + .cg-prob { margin-top: 8px; }
.cg-check { display: flex; gap: 8px; align-items: center; font-size: 12.5px; min-width: 0; animation: cg-slide .45s cubic-bezier(.2,.8,.2,1) both; }
.cg-check b { flex: 0 0 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; color: #fff; background: var(--green); }
.cg-check b svg { width: 10px; height: 10px; }
.cg-check.no b { background: var(--red); }
.cg-check span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Evidence overview and inline detail panel */
.cg-execution { color: #526477; font-size: 9px; margin: 3px 0; white-space: nowrap; }
.cg-node:focus-visible, .cg button:focus-visible, .cg summary:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
.cg-bus-overview:empty { display: none; }
.cg-bus-list { border-top: 1px solid var(--line); background: #f7f9fc; }
.cg-bus-list > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 11px 16px; cursor: pointer; color: #526477; font-size: 12px; list-style: none; }
.cg-bus-list > summary::-webkit-details-marker { display: none; }
.cg-bus-title { color: var(--ink); font-weight: 600; }
.cg-bus-title b { margin-left: 5px; font-size: 10px; padding: 2px 5px; border: 1px solid #cbd5e1; border-radius: 4px; }
.cg-bus-counts { flex: 1; }
.cg-bus-expand { color: var(--blue); }
.cg-bus-expand::after { content: " ＋"; }
.cg-bus-list[open] .cg-bus-expand::after { content: " −"; }
.cg-call-list { margin: 0 16px; border-top: 1px solid var(--line); }
.cg-call-list button { width: 100%; display: grid; grid-template-columns: minmax(80px,1fr) minmax(110px,1fr) 90px 16px; gap: 8px; text-align: left; padding: 9px 0; background: none; border: 0; border-bottom: 1px solid var(--line); font: inherit; color: var(--ink); cursor: pointer; }
.cg-call-list button:hover { color: var(--blue); }
.cg-call-list code { color: var(--mute); overflow-wrap: anywhere; }
.cg-bus-list > .cg-proof-note { margin: 9px 16px; }
.cg-detail { border-top: 1px solid #cbd5e1; background: #fff; }
.cg-detail-head { padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #f8fafc; }
.cg-detail-head h4 { margin: 0; font-size: 15px; }
.cg-detail-head h4:focus { outline: none; }
.cg-detail-head p { margin: 4px 0 0; color: var(--mute); font-size: 12px; }
.cg-detail button { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; background: #fff; font: inherit; cursor: pointer; color: var(--ink); }
.cg-detail-close { flex-shrink: 0; }
.cg-detail-body { padding: 0 16px 16px; max-height: 570px; overflow-y: auto; overscroll-behavior: contain; }
.cg-detail-task { color: #475569; margin: 12px 0; }
.cg-detail-notice { padding: 9px 12px; border-left: 3px solid var(--blue); background: #eff6ff; overflow-wrap: anywhere; }
.cg-detail-notice.warn { border-color: var(--amber); background: #fff7ed; }
.cg-proof-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
.cg-proof { padding: 12px; border: 1px solid var(--line); border-radius: 8px; min-width: 0; }
.cg-proof > header { padding: 0; border: 0; background: none; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.cg-proof h5 { margin: 0; font-size: 13px; flex: 1; }
.cg-proof-number { color: var(--mute); font-size: 11px; background: #f1f5f9; border-radius: 50%; width: 20px; height: 20px; display: grid; place-items: center; }
.cg-proof-state { font-size: 11px; }
.cg-proof-state.ok { color: #15803d; }.cg-proof-state.warn { color: #b45309; }.cg-proof-state.active { color: var(--blue); }.cg-proof-state.muted { color: var(--mute); }
.cg-detail dl { margin: 10px 0; }
.cg-fact { display: grid; grid-template-columns: 95px minmax(0,1fr); gap: 8px; margin: 7px 0; font-size: 12px; }
.cg-fact dt { color: var(--mute); }.cg-fact dd { margin: 0; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.cg-proof-note { color: var(--mute); font-size: 11px; line-height: 1.6; }
.cg-detail details { margin-top: 10px; }
.cg-detail summary { cursor: pointer; color: #475569; font-size: 12px; padding: 4px 0; }
.cg-candidates { list-style: none; padding: 0; margin: 8px 0; }
.cg-candidates li { display: flex; flex-direction: column; gap: 3px; padding: 6px 0; font-size: 12px; overflow-wrap: anywhere; }
.cg-candidates span { color: var(--mute); font-size: 11px; }
.cg-proof-error { color: #b45309; overflow-wrap: anywhere; }
.cg-identifiers { border-top: 1px solid var(--line); padding-top: 8px; }
.cg-detail-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; font-size: 12px; }
.cg-detail-actions .cg-proof-note { margin-left: auto; }
.cg-detail-output { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; background: #f8fafc; padding: 12px; border-radius: 6px; }
.cg-local-execution { background: #f8fafc; padding: 12px; border-radius: 8px; }
@media (max-width: 640px) {
  .cg-head { flex-wrap: wrap; }.cg-title { flex-basis: 100%; flex-wrap: wrap; }.cg-meta { flex-wrap: wrap; }
  .cg-proof-grid { grid-template-columns: minmax(0,1fr); }
  .cg-detail-head, .cg-detail-body { padding-left: 12px; padding-right: 12px; }
  .cg-call-list button { grid-template-columns: minmax(70px,1fr) minmax(90px,1fr) 70px 12px; font-size: 11px; gap: 4px; }
  .cg-bus-counts { flex-basis: 100%; }
  .cg-detail-actions .cg-proof-note { margin-left: 0; }
}

@keyframes cg-in { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes cg-out { to { opacity: 0; transform: scale(.94); } }
@keyframes cg-fork { from { opacity: 0; transform: translateX(-26px) scale(.86); } to { opacity: 1; transform: none; } }
@keyframes cg-ret { 0% { stroke-dashoffset: -.8; opacity: 1; } 88% { opacity: 1; } 100% { stroke-dashoffset: .21; opacity: 0; } }
@keyframes cg-edge-flash { 0%, 70% { stroke: var(--violet); stroke-width: 2.4; } 100% { stroke: #a78bfa; stroke-width: 1.6; } }
@keyframes cg-ripple { from { opacity: .7; transform: scale(1); } to { opacity: 0; transform: scale(1.9); } }
@keyframes cg-gate-in { from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; } to { opacity: 1; max-height: 60px; } }
@keyframes cg-gate-out { from { opacity: 1; max-height: 60px; } to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; } }
@keyframes cg-pop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes cg-popin { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes cg-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cg-slide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
@keyframes cg-spin { to { --cg-a: 360deg; } }
@keyframes cg-rot { to { transform: rotate(360deg); } }
@keyframes cg-flow { to { stroke-dashoffset: -12; } }
@keyframes cg-blink { 50% { opacity: .3; } }
@keyframes cg-breathe { 50% { transform: scale(1.08); } }
@keyframes cg-dots { 0%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
@keyframes cg-shake { 10%, 90% { margin-left: -1px; } 20%, 80% { margin-left: 2px; } 30%, 50%, 70% { margin-left: -4px; } 40%, 60% { margin-left: 4px; } }
@media (prefers-reduced-motion: reduce) { .cg *, .cg *::before { animation: none !important; transition: none !important; } }
`;var m=i=>String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),F=i=>i?m(new Date(i).toLocaleString("zh-CN",{hour12:!1})):"\u672A\u91C7\u96C6",y=(i,e)=>`<div class="cg-fact"><dt>${m(i)}</dt><dd>${m(e||"\u672A\u91C7\u96C6")}</dd></div>`,L=(i,e)=>`<div class="cg-fact"><dt>${m(i)}</dt><dd><time title="${m(e)}">${F(e)}</time></dd></div>`,H=(i,e,s,n,t)=>`<section class="cg-proof"><header><span class="cg-proof-number">${i}</span><h5>${m(e)}</h5><span class="cg-proof-state ${n}">${m(s)}</span></header>${t}</section>`,R=i=>({pending:"\u5C1A\u672A\u6D3E\u53D1",running:"\u6267\u884C\u4E2D",waiting:"\u7B49\u5F85\u7ED3\u679C",unknown:"\u5F85\u6838\u5BF9",done:"\u5DF2\u5B8C\u6210",reused:"\u7ED3\u679C\u590D\u7528",failed:"\u5931\u8D25",skipped:"\u672A\u6267\u884C"})[i??""]??"\u5F85\u6279\u51C6";function T(i){return i.execution?.kind==="agent_bus"||i.remote?"Agent Bus \xB7 DIRECT":i.execution?.kind==="loop_forest"||i.kind==="blackbox"?"\u5BBF\u4E3B\u5185 \xB7 Loop Forest":"\u5BBF\u4E3B\u5185\u6267\u884C"}function V(i){if(!i.bus)return"";let e=i.bus,s=i.run?`\u5173\u8054\u4EFB\u52A1 ${e.linked_tasks} \xB7 \u5DF2\u4FDD\u5B58 ${e.completed} \xB7 \u5F85\u6838\u5BF9 ${e.unresolved}${e.failed?` \xB7 \u5931\u8D25 ${e.failed}`:""}${e.reused?` \xB7 \u590D\u7528 ${e.reused}\uFF08\u5305\u542B\u5728\u5DF2\u4FDD\u5B58\u4E2D\uFF09`:""}`:"\u5F85\u7528\u6237\u6279\u51C6 \xB7 \u5C1A\u672A\u6D3E\u53D1";return`<details class="cg-bus-list"><summary><span class="cg-bus-title">Agent Bus <b>DIRECT</b></span><span>RDC \u80FD\u529B\u7ED1\u5B9A \xB7 ${e.services} \u7C7B\u670D\u52A1 \xB7 ${e.planned_nodes} \u4E2A\u8FDC\u7AEF\u8282\u70B9</span><span class="cg-bus-counts">${m(s)}</span><span class="cg-bus-expand">\u8C03\u7528\u6E05\u5355</span></summary>
    <div class="cg-call-list">${i.nodes.filter(n=>n.execution?.kind==="agent_bus").map(n=>`<button type="button" data-inspect="${m(n.id)}"><span>${m(n.name)}</span><code>${m(n.execution?.binding?.agent_id)}</code><span>${m(R(n.status))}</span><span aria-hidden="true">\u2192</span></button>`).join("")}</div>
    <p class="cg-proof-note">\u7EDF\u8BA1\u6765\u81EA\u672C\u4EFB\u52A1\u7684\u6301\u4E45\u8BB0\u5F55\uFF1B\u5B9E\u4F8B\u5065\u5EB7\u4EC5\u8868\u793A\u53D1\u73B0\u65F6\u7684\u5FEB\u7167\u3002</p></details>`}function B(i){if(!i)return"\u672A\u91C7\u96C6";let e={task_received:"\u5DF2\u6821\u9A8C\u4EFB\u52A1\u56DE\u6267",http_error:"HTTP \u8C03\u7528\u5931\u8D25",protocol_error:"\u534F\u8BAE\u9519\u8BEF",transport_error:"\u672A\u6536\u5230 HTTP \u56DE\u6267",invalid_response:"\u56DE\u6267\u672A\u901A\u8FC7\u6821\u9A8C"}[i.outcome]??"\u7ED3\u679C\u5F85\u6838\u5BF9";return`${i.method} \xB7 ${i.http_status?`HTTP ${i.http_status} \xB7 `:""}${e}${i.error_code?` \xB7 ${i.error_code}`:""}`}function P(i){let e=i.remote;return JSON.stringify({node:i.id,execution:i.execution?{kind:i.execution.kind,path_mode:i.execution.path_mode,binding:i.execution.binding?{agent_id:i.execution.binding.agent_id,version:i.execution.binding.version,card_digest:i.execution.binding.card_digest,contract_digest:i.execution.binding.contract_digest}:void 0}:void 0,request_id:e?.request_id,task_id:e?.task_id,context_id:e?.context_id,node_execution_id:e?.node_execution_id,attempt:e?.attempt,input_digest:e?.input_digest,artifact_id:e?.artifact_id,artifact_digest:e?.artifact_digest},null,2)}function j(i){let e=i.remote,s=i.execution?.binding,n=e?.discovery,t=e?.gateway,a=i.execution?.kind==="agent_bus"||!!e,d=!!e?.artifact_id&&(i.status==="done"||i.status==="reused"),p=i.status==="reused",o=`<header class="cg-detail-head"><div><h4 tabindex="-1">${m(i.name)} \xB7 \u6267\u884C\u8BE6\u60C5</h4><p>${m(T(i))} \xB7 ${m(R(i.status))}</p></div><button type="button" class="cg-detail-close" data-detail-close aria-label="\u5173\u95ED\u6267\u884C\u8BE6\u60C5">\u5173\u95ED \xD7</button></header>`,r=`<p class="cg-detail-task">${m(i.task)}</p>`;if(!a)r+=`<div class="cg-local-execution"><b>${m(T(i))}</b><p>${i.kind==="blackbox"?"\u5728 Java \u5BBF\u4E3B\u7684\u5DF2\u6388\u6743\u8282\u70B9\u5185\u5C55\u5F00 Loop Forest\u3002":"\u7531 Java Graph \u5BBF\u4E3B\u6267\u884C\u672C\u8282\u70B9\u3002"}</p></div>`;else{p&&(r+=`<p class="cg-detail-notice">\u672C\u6B21\u8BFB\u53D6\u5DF2\u4FDD\u5B58\u4EA7\u7269\uFF1B\u4E0B\u65B9\u4FDD\u7559\u539F\u8C03\u7528\u8BB0\u5F55\u3002\u7D2F\u8BA1\u590D\u7528 ${e?.reused_count??1} \u6B21\u3002</p>`),e?.reason&&(r+=`<p class="cg-detail-notice ${i.status==="unknown"||i.status==="failed"?"warn":""}">${m(e.reason)}</p>`);let g=n?`<details data-detail-section="candidates"><summary>\u5F53\u65F6\u7684\u5019\u9009\u5B9E\u4F8B\uFF08${n.candidates.length}\uFF09</summary><ul class="cg-candidates">${n.candidates.map(f=>`<li><code>${m(f.instance_id||"\u5B9E\u4F8B\u6807\u8BC6\u672A\u91C7\u96C6")}</code><span>${m(f.health)} \xB7 ${m(f.capability_version)} \xB7 ${f.eligible?"\u7B26\u5408\u7ED1\u5B9A":"\u672A\u7EB3\u5165\u5339\u914D"}</span></li>`).join("")}</ul><p class="cg-proof-note">\u6B64\u5217\u8868\u662F\u53D1\u73B0\u5FEB\u7167\uFF0C\u5B9E\u9645\u6267\u884C\u5B9E\u4F8B\u9700\u53E6\u884C\u56DE\u4F20\u3002</p></details>`:`<p class="cg-proof-note">${e?"\u8BE5\u8C03\u7528\u7684\u53D1\u73B0\u5FEB\u7167\u672A\u91C7\u96C6\uFF1B\u80FD\u529B\u7248\u672C\u53D6\u81EA\u5DF2\u4FDD\u5B58\u7ED1\u5B9A\u3002":"\u80FD\u529B\u5DF2\u7ED1\u5B9A\uFF0C\u6D3E\u53D1\u524D\u5C06\u518D\u6B21\u67E5\u8BE2 RDC \u5E76\u8BB0\u5F55\u5FEB\u7167\u3002"}</p>`,c=H(1,"RDC \u80FD\u529B\u7ED1\u5B9A",n?"\u6D3E\u53D1\u524D\u5DF2\u6838\u5BF9":"\u5DF2\u4FDD\u5B58\u7ED1\u5B9A",n?"ok":"muted",`<dl>${y("Agent ID",s?.agent_id??e?.agent_id)}${y("\u80FD\u529B\u7248\u672C",s?.version)}${L("\u67E5\u8BE2\u65F6\u523B",n?.checked_at)}</dl>${g}`),l=e?i.status==="unknown"?"\u7ED3\u679C\u5F85\u6838\u5BF9":i.status==="failed"?"\u8C03\u7528\u7ED3\u675F \xB7 \u5931\u8D25":t?.first_receipt?"\u5DF2\u6536\u5230\u4EFB\u52A1\u56DE\u6267":e?.task_id?"\u5DF2\u6709\u4EFB\u52A1\u5173\u8054":e?"\u56DE\u6267\u5F85\u6838\u5BF9":"\u5C1A\u672A\u6D3E\u53D1":"\u5C1A\u672A\u6D3E\u53D1",u=i.status==="unknown"||i.status==="failed"?"warn":t?.first_receipt?"ok":"muted",x=t?`<dl>${y("\u534F\u8BAE",t.protocol)}${L("\u9996\u6B21\u6D3E\u53D1\u5C1D\u8BD5",t.first_send?.started_at)}${L("\u9996\u6B21\u4EFB\u52A1\u56DE\u6267",t.first_receipt?.finished_at)}${y("\u5DF2\u8BB0\u5F55\u8BF7\u6C42",`\u6D3E\u53D1\u5C1D\u8BD5 ${t.send_count} \u6B21 \xB7 \u539F\u4EFB\u52A1\u67E5\u8BE2 ${t.query_count} \u6B21`)}${y("\u6700\u8FD1\u89C2\u6D4B",B(t.last_exchange))}${L("\u6700\u8FD1\u89C2\u6D4B\u65F6\u523B",t.last_exchange?.finished_at)}</dl><p class="cg-proof-note">\u6765\u6E90\uFF1AJava \u5BBF\u4E3B\u89C2\u6D4B\u3002${t.first_send?"":"\u539F\u59CB\u6D3E\u53D1\u89C2\u6D4B\u672A\u91C7\u96C6\u3002"}</p>`:`<p>${e?"Gateway \u8BF7\u6C42\u4E0E\u56DE\u6267\u65F6\u95F4\u672A\u91C7\u96C6\u3002":"\u6267\u884C\u540E\u8BB0\u5F55 Gateway \u8BF7\u6C42\u548C\u6709\u6548\u4EFB\u52A1\u56DE\u6267\u3002"}</p>`;t?.last_error&&(x+=`<details data-detail-section="gateway-error"><summary>\u6700\u8FD1\u9519\u8BEF${d?"\uFF08\u540E\u7EED\u5DF2\u6838\u5BF9\u5E76\u4FDD\u5B58\u7ED3\u679C\uFF09":""}</summary><p class="cg-proof-error">${m(B(t.last_error))}</p><p class="cg-proof-note">${F(t.last_error.finished_at)}</p></details>`);let k=H(2,"Gateway DIRECT",l,u,x),$=H(3,"\u4E13\u4E1A Agent \u6267\u884C",d?"\u6267\u884C\u5DF2\u5B8C\u6210":e?.agent_started_at?"\u5DF2\u9886\u53D6\u8282\u70B9\u8F93\u5165":"\u6682\u65E0\u5F00\u59CB\u8BB0\u5F55",d?"ok":e?.agent_started_at?"active":"muted",`<dl>${y("\u903B\u8F91 Agent",s?.agent_id??e?.agent_id)}${L("\u5F00\u59CB\u8BB0\u5F55",e?.agent_started_at)}${y("\u6A21\u578B\u8C03\u7528\u5C1D\u8BD5",e?`${e.model_calls} \u6B21\uFF08\u5DF2\u8BB0\u5F55\uFF09`:"\u5C1A\u65E0\u8BB0\u5F55")}${y("\u5B9E\u9645\u6267\u884C\u5B9E\u4F8B","\u672A\u91C7\u96C6")}</dl>`),v=H(4,"\u6B63\u5F0F\u7ED3\u679C",p?"\u590D\u7528\u5DF2\u4FDD\u5B58\u4EA7\u7269":d?"\u5DF2\u6301\u4E45\u4FDD\u5B58":"\u5C1A\u672A\u63D0\u4EA4",d?"ok":"muted",d?`<dl>${L("\u63D0\u4EA4\u65F6\u95F4",e?.committed_at)}${y("\u4EA7\u7269\u6807\u8BC6",e?.artifact_id)}</dl><p class="cg-proof-note">\u8F93\u5165\u3001\u4EFB\u52A1\u4E0E\u4E0A\u4E0B\u6587\u6821\u9A8C\u540E\u6301\u4E45\u63D0\u4EA4\u3002</p>`:"<p>\u6B63\u5F0F\u7ED3\u679C\u63D0\u4EA4\u6210\u529F\u540E\uFF0C\u4E0B\u6E38\u8282\u70B9\u624D\u53EF\u6D88\u8D39\u3002</p>");r+=`<div class="cg-proof-grid">${c}${k}${$}${v}</div>
      <details class="cg-identifiers" data-detail-section="ids"><summary>\u5173\u8054\u6807\u8BC6\u4E0E\u6458\u8981</summary><dl>${y("\u8282\u70B9\u6267\u884C ID",e?.node_execution_id)}${y("Request ID",e?.request_id)}${y("Task ID",e?.task_id)}${y("Context ID",e?.context_id)}${y("Attempt",e?.attempt)}${y("\u80FD\u529B\u5361\u6458\u8981",s?.card_digest)}${y("\u5951\u7EA6\u6458\u8981",s?.contract_digest)}${y("\u8F93\u5165\u6458\u8981",e?.input_digest)}${y("\u4EA7\u7269\u6458\u8981",e?.artifact_digest)}${L("\u6D3E\u53D1\u610F\u56FE\u843D\u76D8",e?.intent_saved_at)}</dl></details>
      <div class="cg-detail-actions"><button type="button" data-copy-evidence>\u590D\u5236\u5173\u8054\u4FE1\u606F</button><span role="status" data-copy-status></span><span class="cg-proof-note">\u65F6\u95F4\u6309\u6D4F\u89C8\u5668\u65F6\u533A\u663E\u793A</span></div>`}return i.denied&&(r+=`<p class="cg-detail-notice warn">${m(i.denied)}</p>`),(i.reads?.length||i.contract)&&(r+=`<details data-detail-section="permissions"><summary>\u8BFB\u53D6\u6743\u9650\u4E0E\u8282\u70B9\u5951\u7EA6</summary><dl>${y("\u8BFB\u53D6\u8303\u56F4",i.reads?.join("\u3001"))}${y("\u5951\u7EA6\u6458\u8981",i.contract)}</dl></details>`),i.output&&(r+=`<details data-detail-section="output"><summary>\u67E5\u770B\u4EA7\u7269\u5185\u5BB9\u6458\u8981</summary><pre class="cg-detail-output">${m(i.output)}</pre></details>`),`${o}<div class="cg-detail-body">${r}</div>`}var I=184,K=404,O=64,W=18,A=22,Q=5,Z=520,J=320,z='<svg viewBox="0 0 12 12"><path d="M2.5 6.3l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',Y='<svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',N="http://www.w3.org/2000/svg",ee=["idle","active","done","skip","bad"],te={idle:"#cfd4dc",active:"#93b4f5",done:"#8fd1a6",skip:"#dcdfe4",bad:"#f2a7a7"},h=i=>i.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]),M=i=>i==="done"||i==="reused",ie=i=>i==="running"||i==="waiting"||i==="unknown"||i==="failed"||M(i),se=()=>`-${Math.round(performance.now()%7e3)}ms`,ae=i=>1-Math.pow(1-i,3),ne=0;function oe(i){if(i.getElementById("cg-style"))return;let e=i.createElement("style");e.id="cg-style",e.textContent=C,i.head.appendChild(e)}function re(i){if(!i)return;let e=/^grant-(\d+)$/.exec(i);return e?["ok",`\u540C\u610F ${Number(e[1]).toLocaleString("en-US")}`]:i==="deny"?["bad","\u62D2\u7EDD"]:i==="on_missing_evidence"?["mute","\u8BC1\u636E\u4E0D\u8DB3"]:i==="on_undefined_rule"?["mute","\u89C4\u5219\u672A\u8986\u76D6"]:["mute",i]}function ce(i){switch(i){case"approved":return["ok","\u94F6\u884C\u5DF2\u6279\u51C6"];case"declined":return["bad","\u94F6\u884C\u62D2\u7EDD"];case"cancelled":return["mute","\u5DF2\u64A4\u9500"];case"unknown":return["mute","\u7ED3\u679C\u672A\u77E5 \xB7 \u67E5\u8BE2\u4E2D"]}}function de(i){return!i.negate&&/GRANT/.test(i.contains)?"\u540C\u610F\u65F6":(i.negate?"\u4E0D\u542B ":"\u542B ")+i.contains}var G=class{constructor(e,s={}){this.id=`cg${++ne}`;this.busSig="";this.detailSig="";this.shown=[];this.nodes=new Map;this.edges=new Map;this.first=!0;this.headSig="";this.footSig="";this.frame=0;this.pending=0;this.sizes=new ResizeObserver(()=>{cancelAnimationFrame(this.pending),this.pending=requestAnimationFrame(()=>{[...this.nodes.values()].some(e=>e.el.offsetHeight!==e.h)&&this.layout(!0)})});this.opts=s,oe(e.ownerDocument),this.el=document.createElement("div"),this.el.className="cg",this.el.innerHTML=`<div class="cg-head"></div><div class="cg-bus-overview"></div><div class="cg-canvas"><div class="cg-stage"><svg class="cg-edges"><defs>${ee.map(t=>`<marker id="${this.id}-ar-${t}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5L8.5 5L1 8.5" fill="none" stroke="${te[t]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker>`).join("")}</defs></svg></div><div class="cg-wait"><i></i><i></i><i></i></div></div><div class="cg-foot"></div>`,e.replaceChildren(this.el),this.head=this.el.querySelector(".cg-head"),this.overview=this.el.querySelector(".cg-bus-overview"),this.canvas=this.el.querySelector(".cg-canvas"),this.stage=this.el.querySelector(".cg-stage"),this.svg=this.el.querySelector("svg"),this.foot=this.el.querySelector(".cg-foot");let n=0;new ResizeObserver(()=>{this.g&&this.canvas.clientWidth!==n&&(n=this.canvas.clientWidth,this.layout(!1))}).observe(this.canvas),this.el.addEventListener("click",t=>{let a=t.target;if(a.closest("[data-detail-close]")){this.closePop(!0);return}if(a.closest("[data-copy-evidence]")){this.copyEvidence();return}let d=a.closest("[data-inspect], .cg-slot");d&&this.togglePop(d.dataset.inspect??d.dataset.id)}),this.el.addEventListener("keydown",t=>{if(t.key==="Escape"){this.closePop(!0);return}let a=t.target.closest(".cg-slot");a&&(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.togglePop(a.dataset.id))})}current(){return this.g}render(e){this.g=e,this.el.classList.toggle("m-run",!!e.run),this.el.classList.toggle("m-plan",!e.run),this.el.classList.toggle("m-stalled",!!e.run?.stalled),this.renderHead(e);let s=V(e);if(s!==this.busSig){let a=this.overview.querySelector("details")?.open;this.busSig=s,this.overview.innerHTML=s;let d=this.overview.querySelector("details");d&&(d.open=!!a)}let n=new Map;e.layers.forEach((a,d)=>a.forEach(p=>n.set(p,d))),this.shown=e.run?e.nodes.filter(a=>ie(a.status)):e.nodes;let t=new Set;this.shown.forEach((a,d)=>{t.add(a.id);let p=this.nodes.get(a.id);if(!p){let o=document.createElement("div");o.className="cg-slot",o.dataset.id=a.id;let r=document.createElement("div");o.appendChild(r),this.stage.appendChild(o),this.sizes.observe(r),r.addEventListener("transitionend",c=>{c.target===r&&c.propertyName==="width"&&this.drawEdges()}),p={slot:o,el:r,sig:"",branches:[],wide:!1,x:0,y:0,fx:0,fy:0,tx:0,ty:0,w:I,h:0,placed:!1},this.nodes.set(a.id,p);let g=this.first?(n.get(a.id)??0)*110+d*25:(a.deps??[]).some(c=>this.nodes.has(c))?240:0;r.style.setProperty("--d",`${g}ms`),r.style.animationDelay=`${g}ms`,r.dataset.enter="1"}this.renderNode(p,a,e)});for(let[a,d]of this.nodes)t.has(a)||(this.sizes.unobserve(d.el),this.nodes.delete(a),d.el.classList.remove("enter"),d.el.classList.add("leave"),setTimeout(()=>d.slot.remove(),J));this.renderEdges(e,n),this.renderFoot(e),this.layout(!this.first);for(let a of this.nodes.values())a.wide&&this.drawFan(a);this.pop&&this.togglePop(this.pop.dataset.id,!0),this.first=!1}renderHead(e){let s=e.nodes.length,n=e.nodes.filter(u=>M(u.status)||u.status==="skipped").length,t=e.nodes.filter(u=>u.status==="reused").length,a;if(e.verify){let u=e.verify.checks.filter(x=>x.ok).length;a=e.verify.ok?["ok",`\u9A8C\u8BC1\u901A\u8FC7 ${u}/${e.verify.checks.length}`]:["bad",`\u9A8C\u8BC1\u672A\u901A\u8FC7 ${u}/${e.verify.checks.length}`]}else e.run?(a={queued:["wait","\u6392\u961F\u4E2D"],running:["run",`\u6267\u884C\u4E2D ${n}/${s}`],waiting:["wait","\u7B49\u5F85\u6838\u5BF9\u8FDC\u7AEF\u7ED3\u679C"],done:["ok","\u5DF2\u5B8C\u6210"],failed:["bad","\u6267\u884C\u5931\u8D25"]}[e.run.status]??["mute",e.run.status],e.run.stalled&&(a=["bad","\u6267\u884C\u5668\u65E0\u54CD\u5E94 \xB7 \u7B49\u5F85\u63A5\u7BA1"])):e.ok?e.superseded?a=["mute",`\u5DF2\u66F4\u65B0\u4E3A v${e.superseded}`]:a=["wait","\u5F85\u6279\u51C6"]:a=["bad","\u9884\u68C0\u672A\u901A\u8FC7"];let d=e.run&&e.run.leases>1?`<span class="cg-chip soft">\u21BB \u6267\u884C\u5668\u91CD\u542F \xB7 \u590D\u7528 ${t} \u6B65</span>`:"",p=!!e.approve&&!!this.opts.approve&&!this.opts.page,o=p?'<button class="cg-btn" data-approve>\u6279\u51C6</button>':"",r=e.run?.status==="running"&&!e.run.stalled?e.nodes.filter(u=>u.status==="running").map(u=>u.name):[],g=r.length?`<span class="cg-now"><i></i>\u6B63\u5728\uFF1A${h(r.join("\u3001"))}</span>`:`<span class="cg-ver">${h(e.case)} \xB7 ${h(e.plan)} v${e.version}</span>`,c=[e.goal,g,a.join(),d,o].join("|");c!==this.headSig&&(this.headSig=c,this.head.innerHTML=`<div class="cg-title"><span class="cg-goal">${h(e.goal||`${e.case} \u6388\u4FE1\u5C3D\u8C03`)}</span>${g}</div>
        <div class="cg-meta">${d}<span class="cg-chip ${a[0]}"><i></i>${h(a[1])}</span>${o}</div><div class="cg-bar"><b></b></div>`,this.head.querySelector("[data-approve]")?.addEventListener("click",u=>{u.stopPropagation(),this.toggleGate()})),p||this.closeGate();let l=this.head.querySelector(".cg-bar");l.classList.toggle("ok",e.run?.status==="done"),requestAnimationFrame(()=>{l.firstElementChild.style.width=e.run?`${n/Math.max(s,1)*100}%`:"0"})}renderNode(e,s,n){let t=s.status??"plan",a=!n.ok&&!n.run&&!!s.denied,d=s.kind==="judge",p=s.kind==="effect",o=d&&M(t)?re(n.run?.decision):p&&M(t)?ce(n.run?.receipt):void 0,r=(s.branches??[]).slice(0,Q),g=(s.branches?.length??0)-r.length,c=!!n.run&&s.kind==="blackbox"&&r.length>0,l=["running","waiting","unknown"].includes(t)?s.activity??"":"",u=JSON.stringify([s.name,s.task,t,a,o,l,g,T(s),r.map(b=>[b.status,b.title,b.activity,b.finding,b.retried])]);if(e.wide=c,e.el.tabIndex=0,e.el.setAttribute("role","button"),e.el.setAttribute("aria-label",`${s.name}\uFF0C${T(s)}\uFF0C\u67E5\u770B\u6267\u884C\u8BE6\u60C5`),e.el.setAttribute("aria-expanded",String(this.pop?.dataset.id===s.id)),e.el.className=`cg-node k-${s.kind} s-${t}${a?" denied":""}${c?" group":""}${e.el.dataset.enter?" enter":""}`,u===e.sig)return;let x=e.sig!==""&&JSON.parse(e.sig)[2]!==t,k=e.sig===""?!1:JSON.parse(e.sig)[3];if(e.sig=u,e.el.dataset.enter&&!e.el.dataset.listening){e.el.dataset.listening="1";let b=E=>{E.target===e.el&&(e.el.removeEventListener("animationend",b),delete e.el.dataset.enter,e.el.classList.remove("enter"),e.el.style.animationDelay="")};e.el.addEventListener("animationend",b)}let $=x||!this.first?"0ms":void 0;$&&e.el.style.setProperty("--d",$);let v=[];s.kind==="blackbox"&&v.push(`<span class="cg-tag bb">${c?"\u9ED1\u76D2 \xB7 Loop Forest":"\u9ED1\u76D2"}</span>`),s.effect==="irreversible"&&v.push('<span class="cg-tag irrev">\u4E0D\u53EF\u9006</span>'),a&&v.push('<span class="cg-tag deny pop">\u65E0\u6743\u9650</span>'),t==="reused"&&v.push('<span class="cg-tag reuse pop">\u590D\u7528</span>'),t==="skipped"&&v.push('<span class="cg-tag skip">\u672A\u6267\u884C</span>'),t==="waiting"&&v.push('<span class="cg-tag">\u7B49\u5F85\u7ED3\u679C</span>'),t==="unknown"&&v.push('<span class="cg-tag deny">\u7ED3\u679C\u5F85\u6838\u5BF9</span>');let f=t==="done"?`<span class="cg-ok">${z}</span>`:t==="reused"?`<span class="cg-ok reused">${z}</span>`:t==="failed"?`<span class="cg-ok fail">${Y}</span>`:"",_=(o?`<div class="cg-res ${o[0]}">${h(o[1])}</div>`:"")+(l?`<div class="cg-act" title="${h(l)}"><i></i><span>${h(l)}</span></div>`:""),S=`<div class="cg-av">${h([...s.name][0]??"?")}</div><div class="cg-body"><div class="cg-name">${h(s.name)}</div><div class="cg-execution">${h(T(s))}</div><div class="cg-task">${h(s.task)}</div>${_}</div>`,w;if(c)w=this.renderGroup(e,S,r,g);else{let b=s.kind==="blackbox"&&!n.run?'<div class="cg-bb closed"><i></i><i></i><i></i><span>\u8FD0\u884C\u65F6\u5C55\u5F00</span></div>':"";w=S+b,e.branches=[]}e.el.innerHTML=`${w}${v.length?`<div class="cg-tags">${v.join("")}</div>`:""}${f}`,e.el.querySelectorAll(".cg-ok, .cg-res, .cg-tag.pop").forEach(b=>{b.closest(".cg-lfb")||(b.style.animationDelay="calc(var(--d, 0ms) + 280ms)")}),c&&(this.drawFan(e),requestAnimationFrame(()=>requestAnimationFrame(()=>e.el.querySelectorAll(".cg-fan-edges .fb:not(.drawn)").forEach(b=>b.classList.add("drawn"))))),a&&!k&&(e.el.classList.remove("shake"),setTimeout(()=>e.el.classList.add("shake"),this.first?900:50))}renderGroup(e,s,n,t){let a=e.branches,d=0,p=!1,o=se(),r=[],g=[];return n.forEach((c,l)=>{let u=l>=a.length,x=!u&&a[l]==="started"&&c.status==="finished";p||(p=x);let k=u?220+d++*160:0;r.push(`<g class="b-${h(c.status)}"><path class="fb${u?"":" drawn"}${x?" flash":""}" pathLength="1" style="transition-delay:${u?k-220:0}ms, 0ms"/><path class="ff" style="animation-delay:${o}"/><path class="fr${x?" ret":""}" pathLength="1"/></g>`);let $=c.status==="started"&&c.activity?`<div class="cg-lfb-sub act"><i style="animation-delay:${o}"></i><span>${h(c.activity)}</span></div>`:c.status==="finished"&&c.finding?`<div class="cg-lfb-sub"><b class="find ${h(c.tone??"")}${x||u?" pop":""}">${h(c.finding)}</b></div>`:c.status==="interrupted"?'<div class="cg-lfb-sub">\u6267\u884C\u5668\u91CD\u542F\uFF0C\u5DF2\u4E2D\u65AD</div>':`<div class="cg-lfb-sub"><span>${h(c.relation??"")}</span></div>`,v=c.status==="finished"?`<span class="cg-lfb-ok${x?" pop":""}">${z}</span>`:"";g.push(`<div class="cg-lfb s-${h(c.status)}${u?" enter":""}" style="animation-delay:${k}ms;--ph:${o}" title="${h(c.goal)}"><div class="cg-lfb-av">${h([...c.title][0]??"?")}</div><div class="cg-lfb-body"><div class="cg-lfb-name">${c.retried?'<em title="\u4E0A\u6B21\u6267\u884C\u4E2D\u65AD\u540E\u91CD\u65B0\u5206\u53C9">\u21BB</em>':""}${h(c.title)}</div>${$}</div>${v}</div>`)}),e.branches=n.map(c=>c.status),`<svg class="cg-fan-edges">${r.join("")}</svg><div class="cg-host">${s}${p?'<i class="cg-ripple"></i>':""}</div><div class="cg-fan">${g.join("")}${t>0?`<div class="cg-lfb-more">\u53E6 ${t} \u4E2A\u5206\u652F</div>`:""}</div>`}drawFan(e){let s=e.el.querySelector(".cg-host");if(!s)return;let n=s.offsetLeft+s.offsetWidth+2,t=s.offsetTop+s.offsetHeight/2,a=e.el.querySelectorAll(".cg-fan-edges g");e.el.querySelectorAll(".cg-lfb").forEach((d,p)=>{let o=d.offsetLeft-2,r=d.offsetTop+d.offsetHeight/2,g=(o-n)*.6,c=`M${n},${t} C${n+g},${t} ${o-g},${r} ${o},${r}`;a[p]?.querySelectorAll("path").forEach(l=>l.setAttribute("d",c))})}renderEdges(e,s){let n=new Map(e.nodes.map(o=>[o.id,o])),t=new Map(this.shown.map(o=>[o.id,o])),a=new Map,d=o=>{let r=a.get(o);if(r)return r;r=new Set,a.set(o,r);for(let g of n.get(o)?.deps??[])r.add(g),d(g).forEach(c=>r.add(c));return r},p=new Set;for(let o of this.shown){let r=(o.deps??[]).filter(g=>t.has(g));for(let g of r){if(o.when?.step!==g&&r.some(k=>k!==g&&d(k).has(g)))continue;let c=`${g}>${o.id}`;p.add(c);let l=this.edges.get(c);if(!l){let k=document.createElementNS(N,"g"),$=document.createElementNS(N,"path");$.setAttribute("class","base"),$.setAttribute("pathLength","1");let v=document.createElementNS(N,"path");v.setAttribute("class","flow"),k.append($,v),this.svg.appendChild(k),l={from:g,to:o.id,g:k,base:$,flow:v,drawn:!1},this.edges.set(c,l);let f=this.first?260+(s.get(g)??0)*120:0;$.style.transitionDelay=`${f}ms, 0ms`}o.when&&o.when.step===g&&!l.cond&&(l.cond=document.createElement("div"),l.cond.className="cg-cond",l.cond.textContent=de(o.when),this.stage.appendChild(l.cond));let u=t.get(g),x="idle";if(e.run?o.status==="skipped"?x="skip":M(u.status)&&o.status==="running"?x="active":M(u.status)&&M(o.status)&&(x="done"):!e.ok&&o.denied&&(x="bad"),l.g.setAttribute("class",`e-${x}`),l.base.setAttribute("marker-end",`url(#${this.id}-ar-${x})`),l.cond){let k=e.run?.decision;l.cond.classList.toggle("on",!!k&&/^grant/.test(k)&&!o.when?.negate),l.cond.classList.toggle("off",o.status==="skipped")}}}for(let[o,r]of this.edges)p.has(o)||(this.edges.delete(o),r.g.classList.add("gone"),r.cond?.classList.add("gone"),setTimeout(()=>{r.g.remove(),r.cond?.remove()},J))}drawEdges(){let e=new Map,s=new Map;for(let t of this.edges.values())(e.get(t.from)??e.set(t.from,[]).get(t.from)).push(t),(s.get(t.to)??s.set(t.to,[]).get(t.to)).push(t);let n=(t,a,d,p)=>{let o=[...t].sort((l,u)=>(p(l)?.y??0)-(p(u)?.y??0)),r=o.length,g=o.indexOf(a),c=r>1?Math.min(9,d.h*.6/(r-1)):0;return d.y+d.h/2+(g-(r-1)/2)*c};for(let t of this.edges.values()){let a=this.nodes.get(t.from),d=this.nodes.get(t.to);if(!a||!d)continue;let p=a.x+(a.el.offsetWidth||a.w),o=d.x-3,r=n(e.get(t.from),t,a,u=>this.nodes.get(u.to)),g=n(s.get(t.to),t,d,u=>this.nodes.get(u.from)),c=Math.max(26,(o-p)*.5),l=`M${p},${r} C${p+c},${r} ${o-c},${g} ${o},${g}`;t.base.setAttribute("d",l),t.flow.setAttribute("d",l),t.cond&&(t.cond.style.left=`${(p+o)/2}px`,t.cond.style.top=`${(r+g)/2}px`),t.drawn||(t.drawn=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>t.base.classList.add("drawn"))))}}layout(e){let s=this.g,n=new Map(this.shown.map(f=>[f.id,f])),t=s.layers.map(f=>f.filter(_=>n.has(_))).filter(f=>f.length),a=new Set(t.flat()),d=this.shown.map(f=>f.id).filter(f=>!a.has(f));if(d.length&&t.push(d),this.canvas.classList.toggle("empty",!t.length),this.stage.style.transition=e?"":"none",!t.length){this.canvas.style.height="84px";return}for(let f of this.nodes.values())f.h=f.el.offsetHeight,f.w=f.wide?K:I;let p=t.map(f=>f.reduce((_,S)=>_+this.nodes.get(S).h,0)+(f.length-1)*W),o=[],r=A;for(let f of t)o.push(r),r+=Math.max(...f.map(_=>this.nodes.get(_).w))+O;r+=A-O;let g=Math.max(...p,60),c=new Map;t.forEach((f,_)=>{let S=f.map((b,E)=>{let q=(n.get(b).deps??[]).filter(D=>c.has(D));return{id:b,i:E,bc:q.length?q.reduce((D,U)=>D+c.get(U),0)/q.length:1/0}});_>0&&S.sort((b,E)=>b.bc===E.bc?b.i-E.i:b.bc-E.bc);let w=A+(g-p[_])/2;for(let{id:b}of S){let E=this.nodes.get(b);E.tx=o[_],E.ty=w,c.set(b,w+E.h/2),w+=E.h+W}});let l=g+A*2,u=this.canvas.clientWidth||r,x=Math.min(1,u/r),k=Math.max(0,(u-r*x)/2);this.stage.style.width=`${r}px`,this.stage.style.height=`${l}px`,this.svg.setAttribute("width",String(r)),this.svg.setAttribute("height",String(l)),this.stage.style.transform=`translate(${k}px,0) scale(${x})`,this.canvas.style.height=`${Math.ceil(l*x)}px`,cancelAnimationFrame(this.frame);for(let f of this.nodes.values())(!f.placed||!e)&&(f.x=f.tx,f.y=f.ty,f.placed=!0),f.fx=f.x,f.fy=f.y;let $=performance.now(),v=f=>{let _=e?Math.min(1,(f-$)/Z):1,S=ae(_);for(let w of this.nodes.values())w.x=w.fx+(w.tx-w.fx)*S,w.y=w.fy+(w.ty-w.fy)*S,w.slot.style.transform=`translate(${w.x}px,${w.y}px)`;this.drawEdges(),_<1&&(this.frame=requestAnimationFrame(v))};v($)}renderFoot(e){let s="";if(e.verify){let n=this.first?700:0;s=`<div class="cg-checks">${e.verify.checks.map((t,a)=>`<div class="cg-check${t.ok?"":" no"}" style="animation-delay:${n+a*90}ms" title="${h(t.detail)}"><b>${t.ok?z:Y}</b><span>${h(t.name)}</span></div>`).join("")}</div>${e.verify.checks.filter(t=>!t.ok).map(t=>{let a=t.items??[],d=a.filter(p=>p.includes("\u2717"));return(d.length?d:a.length?a:[t.detail]).map(p=>`<div class="cg-prob">${h(`${t.name}\uFF1A${p}`)}</div>`).join("")}).join("")}`}else!e.ok&&e.problems?.length&&(s=e.problems.map((n,t)=>`<div class="cg-prob" style="animation-delay:${(this.first?600:0)+t*80}ms">${h(n)}</div>`).join(""));s!==this.footSig&&(this.footSig=s,this.foot.innerHTML=s)}toggleGate(){if(this.gate){this.closeGate();return}let e=this.g,s=document.createElement("form");s.className="cg-gate",s.innerHTML=`<span class="who">\u4EE5 <b>alice</b>\uFF08\u5BA2\u6237\u7ECF\u7406\uFF09\u6279\u51C6</span>
      <input type="password" placeholder="\u5BC6\u7801" autocomplete="current-password" aria-label="\u5BC6\u7801">
      <button class="cg-btn" type="submit">\u6279\u51C6\u6267\u884C</button>
      <span class="msg"></span>
      <span class="hash" title="${h(e.hash)}">\u7ED1\u5B9A ${h(e.hash.replace("sha256:","").slice(0,8))}</span>`;let n=s.querySelector("input"),t=s.querySelector("button"),a=s.querySelector(".msg");s.addEventListener("click",d=>d.stopPropagation()),s.addEventListener("submit",async d=>{if(d.preventDefault(),!n.value){n.focus();return}t.classList.add("busy"),t.textContent="\u6279\u51C6\u4E2D\u2026",a.textContent="";let p=await this.opts.approve(this.g,"alice",n.value).catch(o=>String(o));if(p){t.classList.remove("busy"),t.textContent="\u6279\u51C6\u6267\u884C",a.textContent=p,s.classList.remove("shake"),s.offsetWidth,s.classList.add("shake"),n.select();return}s.classList.add("done"),s.innerHTML=`<span class="ok">${z}\u5DF2\u6279\u51C6\uFF0C\u5F00\u59CB\u6267\u884C</span>`,this.opts.onApproved?.(),setTimeout(()=>this.closeGate(),1600)}),this.head.after(s),this.gate=s,n.focus()}closeGate(){if(!this.gate)return;let e=this.gate;this.gate=void 0,e.classList.add("leave"),setTimeout(()=>e.remove(),260)}togglePop(e,s=!1){if(this.pop?.dataset.id===e&&!s){this.closePop(!0);return}let n=this.g?.nodes.find(l=>l.id===e);if(!n){this.closePop();return}let t=JSON.stringify(n);if(s&&t===this.detailSig)return;this.detailSig=t;let a=this.pop??document.createElement("div"),d=s?[...a.querySelectorAll("details[open]")].map(l=>l.dataset.detailSection):[],p=s?a.querySelector(".cg-detail-body")?.scrollTop??0:0,o=s&&a.contains(a.ownerDocument.activeElement)?a.ownerDocument.activeElement:void 0,r=o?.closest("[data-detail-section]")?.dataset.detailSection,g=o?.hasAttribute("data-copy-evidence"),c=o?.hasAttribute("data-detail-close");a.className="cg-detail",a.dataset.id=e,a.setAttribute("role","region"),a.setAttribute("aria-label",`${n.name}\u6267\u884C\u8BE6\u60C5`),a.innerHTML=j(n),this.pop||(this.el.appendChild(a),this.pop=a),a.querySelectorAll("details").forEach(l=>{l.open=d.includes(l.dataset.detailSection)}),a.querySelector(".cg-detail-body").scrollTop=p,r&&[...a.querySelectorAll("[data-detail-section]")].find(l=>l.dataset.detailSection===r)?.querySelector("summary")?.focus({preventScroll:!0}),g&&a.querySelector("[data-copy-evidence]")?.focus({preventScroll:!0}),c&&a.querySelector("[data-detail-close]")?.focus({preventScroll:!0});for(let[l,u]of this.nodes)u.el.setAttribute("aria-expanded",String(l===e));s||(a.querySelector("h4")?.focus({preventScroll:!0}),a.scrollIntoView({block:"nearest",behavior:"smooth"}))}async copyEvidence(){let e=this.pop,s=this.g?.nodes.find(t=>t.id===e?.dataset.id);if(!s||!e)return;let n=e.querySelector("[data-copy-status]");try{await navigator.clipboard.writeText(P(s)),n&&(n.textContent="\u5DF2\u590D\u5236")}catch{n&&(n.textContent="\u6D4F\u89C8\u5668\u672A\u5141\u8BB8\u590D\u5236\uFF0C\u8BF7\u5C55\u5F00\u5173\u8054\u6807\u8BC6\u624B\u52A8\u590D\u5236\u3002")}}closePop(e=!1){let s=this.pop?.dataset.id;this.pop?.remove(),this.pop=void 0,this.detailSig="";for(let n of this.nodes.values())n.el.setAttribute("aria-expanded","false");e&&s&&(this.nodes.get(s)?.el??[...this.overview.querySelectorAll("[data-inspect]")].find(t=>t.dataset.inspect===s))?.focus({preventScroll:!0})}};function X(i,e,s=a=>a,n=1200,t=!1){let a=!1,d=0,p=0,o=e.live,r=async()=>{if(!(a||!o)){try{let g=await fetch(o,{cache:"no-store"});if(!g.ok)throw new Error(String(g.status));let c=await g.json();if(a)return;p=0;for(let l of["live","confirm","approve"])c[l]&&(c[l]=s(c[l]));c.run&&(c.run.url=s(c.run.url)),i.render(c),o=c.live}catch{if(++p>30)return}o&&!a&&(d=window.setTimeout(r,n))}};return o&&(d=window.setTimeout(r,t?0:n)),()=>{a=!0,clearTimeout(d)}}for(let i of document.querySelectorAll("[data-graph]")){let e=new G(i,{page:!0});fetch(i.dataset.graph,{cache:"no-store"}).then(s=>s.json()).then(s=>{e.render(s),X(e,s)})}})();
