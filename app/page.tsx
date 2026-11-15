"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Compass, Database, Map, Mountain, RotateCcw, Sparkles, Timer, X } from "lucide-react";
import content from "./geotype-content.generated.json";

type Axis = "journey" | "uplift" | "transition" | "flux";
type Scores = Record<Axis, number>;
type Question = { id: number; title: string; text: string; left: string; right: string; axis: Axis; reverse: boolean; weight: number; construct: string };
type GeoType = { id: string; order: number; name: string; english: string; portrait: number; center: Scores; overview: string; daily: string; strengthsAndStuck: string; relationsAndWork: string; geography: string; closing: string };

const questions = content.questions as Question[];
const geoTypes = content.types as GeoType[];
const axes: Axis[] = ["journey", "uplift", "transition", "flux"];

const axisMeta: Record<Axis, { left: string; right: string; short: string; description: string; leftReading: string; rightReading: string; middleReading: string }> = {
  journey: { left: "栖居", right: "行旅", short: "恢复方式", description: "你更容易在熟悉、稳定的空间里恢复，还是从新环境、交流与变化中恢复。", leftReading: "你通常需要先回到熟悉的节奏，才能重新听清自己的想法。独处或稳定环境不是退缩，而是整理心理资源。", rightReading: "新环境、现场交流和变化更容易让你重新活跃。你常在接触世界的过程中确认感受、形成想法。", middleReading: "你会根据关系质量与当时消耗选择恢复方式：低质量的热闹未必补充你，真正合拍的交流却可能比独处更有效。" },
  uplift: { left: "沉积", right: "抬升", short: "信息方式", description: "你更依赖细节、经验和事实，还是更习惯寻找模式、趋势与可能。", leftReading: "你先让事实落稳，再形成判断。具体经验、明确边界与可验证的细节，是你理解复杂问题的可靠材料。", rightReading: "你很自然地从细节中寻找结构，关心事情为何发生、将通向哪里，以及是否存在另一种解释框架。", middleReading: "你能在材料与结构之间往返：既不愿让宏大解释脱离事实，也不满足于只罗列现象。" },
  transition: { left: "界线", right: "过渡", short: "判断方式", description: "面对分歧时，你更重视原则、责任与边界，还是情境、关系与缓冲。", leftReading: "你希望责任和标准能够被说清楚。原则对你不是冷漠，而是避免亲疏和一时情绪偷偷改变尺度。", rightReading: "你会把规则放回具体处境里判断，关注决定由谁承受、关系是否还有继续协商的空间。", middleReading: "你会同时询问“是否合理”和“对人意味着什么”，并根据风险决定先守边界还是先修复关系。" },
  flux: { left: "定势", right: "流变", short: "推进方式", description: "你更习惯先建立结构、计划与收束方式，还是根据现实反馈调整路径。", leftReading: "你通过结构把意图变成现实。计划不是束缚，而是为重要的事情安排时间、顺序与结束条件。", rightReading: "你愿意让道路在行走中出现。开放并非没有方向，而是允许新信息真正改变原来的路径。", middleReading: "你偏好可调整的秩序：方向要足够清楚，让人能够行动；路径也要留有余地，让现实参与修正。" },
};

function calculateScores(answers: Record<number, number>): Scores {
  const scores: Scores = { journey: 50, uplift: 50, transition: 50, flux: 50 };
  for (const axis of axes) {
    const answered = questions.filter((question) => question.axis === axis && answers[question.id] !== undefined);
    if (!answered.length) continue;
    const weight = answered.reduce((sum, question) => sum + question.weight, 0);
    scores[axis] = answered.reduce((sum, question) => sum + (question.reverse ? 100 - answers[question.id] : answers[question.id]) * question.weight, 0) / weight;
  }
  return scores;
}

function typeDistance(scores: Scores, type: GeoType) { return Math.sqrt(axes.reduce((sum, axis) => sum + (scores[axis] - type.center[axis]) ** 2, 0)); }
function getMatch(scores: Scores) {
  const ranked = geoTypes.map((type) => ({ type, distance: typeDistance(scores, type) })).sort((a, b) => a.distance - b.distance);
  const separation = (ranked[1].distance - ranked[0].distance) / Math.max(ranked[1].distance, 0.001);
  return { primary: ranked[0].type, adjacent: ranked[1].type, confidence: separation >= .28 ? "轮廓清楚" : separation >= .12 ? "较为接近" : "暂时开放" };
}
function axisReading(axis: Axis, score: number) { const meta = axisMeta[axis]; if (score < 44) return { title: `更靠近${meta.left}`, text: meta.leftReading }; if (score > 56) return { title: `更靠近${meta.right}`, text: meta.rightReading }; return { title: "位于两端之间", text: meta.middleReading }; }
function shortLead(text: string) { const sentence = text.match(/^.*?[。！？]/)?.[0]; return sentence || text; }
function centerLabel(axis: Axis, value: number) { const meta = axisMeta[axis]; return value < 50 ? `${meta.left} ${Math.round(100 - value)}` : `${meta.right} ${Math.round(value)}`; }
function MiniAvatar({ type, large = false }: { type: GeoType; large?: boolean }) { const x = (type.portrait % 4) * 33.333; const y = Math.floor(type.portrait / 4) * 33.333; return <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ backgroundPosition: `${x}% ${y}%` }}><i>{type.english}</i></div>; }

type SubmissionPayload = { sessionId: string; startedAt: string; completedAt: string; answers: Record<number, number>; questionTimesMs: Record<number, number>; resultCode: string; axisScores: Scores };
const PENDING_SUBMISSION_KEY = "geotype.pending-submission";
async function submitResponse(payload: SubmissionPayload) {
  const config = window as Window & { GEOTYPE_SUBMISSION_ENDPOINT?: string; GEOTYPE_SUPABASE_URL?: string; GEOTYPE_SUPABASE_PUBLISHABLE_KEY?: string };
  if (config.GEOTYPE_SUPABASE_URL && config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY) {
    const completed = new Date(payload.completedAt).getTime(); const started = new Date(payload.startedAt).getTime();
    const response = await fetch(`${config.GEOTYPE_SUPABASE_URL}/rest/v1/submissions`, { method: "POST", headers: { apikey: config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY}`, "content-type": "application/json", prefer: "return=minimal" }, body: JSON.stringify({ session_id: payload.sessionId, started_at: payload.startedAt, completed_at: payload.completedAt, answers: payload.answers, question_times: payload.questionTimesMs, result_code: payload.resultCode, axis_scores: payload.axisScores, total_duration_ms: Math.max(0, completed - started), user_agent: navigator.userAgent }), keepalive: true });
    if (!response.ok && response.status !== 409) throw new Error(`Submission failed: ${response.status}`);
    return response;
  }
  const response = await fetch(config.GEOTYPE_SUBMISSION_ENDPOINT || "/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
  if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
  return response;
}
function persistResponse(payload: SubmissionPayload) {
  try { localStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(payload)); } catch {}
  return submitResponse(payload).then((response) => {
    try { const queued = localStorage.getItem(PENDING_SUBMISSION_KEY); if (queued && JSON.parse(queued).sessionId === payload.sessionId) localStorage.removeItem(PENDING_SUBMISSION_KEY); } catch {}
    return response;
  });
}

export default function Home() {
  const [screen, setScreen] = useState<"home" | "quiz" | "result" | "atlas">("home");
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState<Record<number, number>>({}); const [times, setTimes] = useState<Record<number, number>>({});
  const [selectedType, setSelectedType] = useState<GeoType | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const enteredAt = useRef(Date.now()); const startedAt = useRef(new Date().toISOString()); const sessionId = useRef(""); const pendingPayload = useRef<SubmissionPayload | null>(null);
  useEffect(() => { sessionId.current ||= crypto.randomUUID(); try { const queued = localStorage.getItem(PENDING_SUBMISSION_KEY); if (queued) saveResponse(JSON.parse(queued)); } catch { localStorage.removeItem(PENDING_SUBMISSION_KEY); } }, []); useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [screen, index]);
  useEffect(() => { if (!selectedType) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedType(null); }; document.body.style.overflow = "hidden"; window.addEventListener("keydown", close); return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); }; }, [selectedType]);
  const axisScores = useMemo(() => calculateScores(answers), [answers]); const match = useMemo(() => getMatch(axisScores), [axisScores]); const current = questions[index];
  function saveResponse(payload: SubmissionPayload) { pendingPayload.current = payload; setSubmissionStatus("saving"); void persistResponse(payload).then(() => { pendingPayload.current = null; setSubmissionStatus("saved"); }).catch(() => setSubmissionStatus("error")); }
  function retrySubmission() { if (pendingPayload.current) saveResponse(pendingPayload.current); }
  function startQuiz() { startedAt.current = new Date().toISOString(); sessionId.current = crypto.randomUUID(); enteredAt.current = Date.now(); pendingPayload.current = null; setSubmissionStatus("idle"); setAnswers({}); setTimes({}); setIndex(0); setScreen("quiz"); }
  function captureTime(questionId: number) { setTimes((previous) => ({ ...previous, [questionId]: (previous[questionId] || 0) + Date.now() - enteredAt.current })); enteredAt.current = Date.now(); }
  function next() { if (answers[current.id] === undefined) return; const finalTimes = { ...times, [current.id]: (times[current.id] || 0) + Date.now() - enteredAt.current }; setTimes(finalTimes); enteredAt.current = Date.now(); if (index < questions.length - 1) return setIndex((value) => value + 1); setScreen("result"); saveResponse({ sessionId: sessionId.current, startedAt: startedAt.current, completedAt: new Date().toISOString(), answers, questionTimesMs: finalTimes, resultCode: match.primary.id, axisScores }); }
  function previous() { if (index === 0) return setScreen("home"); captureTime(current.id); setIndex((value) => value - 1); }

  return <main>
    <nav className="nav"><button className="brand" onClick={() => setScreen("home")}><span>GEO</span><b>/TYPE</b><small>地格志</small></button><div className="nav-links"><button onClick={() => setScreen("atlas")}>十六型图鉴</button><button onClick={startQuiz} className="nav-cta">开始作答 <ArrowRight size={15}/></button></div></nav>
    {screen === "home" && <><section className="hero"><div className="topo-lines"/><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> 十六型地理人格图鉴</div><h1>在山海之间，<br/><em>认出自己的性情</em></h1><p>30道生活情境题，观察你如何恢复、理解信息、处理分歧，又怎样推进生活。结果保留四个0—100连续分数，再寻找与你坐标最接近的地理意象。</p><div className="hero-actions"><button className="primary" onClick={startQuiz}>开始作答 <ArrowRight/></button><button className="secondary" onClick={() => setScreen("atlas")}>翻阅十六型图鉴</button></div><div className="trust-row"><span><Timer/> 约6分钟</span><span><Map/> 30道情境题</span><span><Compass/> 16种地理人格</span></div></div><div className="hero-art"><div className="atlas-sheet"><img src="geotype-portraits-v2.webp" width="1256" height="1256" loading="eager" decoding="async" fetchPriority="high" alt="十六种地理人格人物图鉴"/><div className="atlas-caption"><span>FIELD PLATE · 01—16</span><b>山海各有形成过程，人也一样</b></div></div><div className="hero-index">栖居 / 行旅 · 沉积 / 抬升 · 界线 / 过渡 · 定势 / 流变</div><div className="stamp">16<br/><small>GEO TYPES</small></div></div></section><section className="ticker"><span>岩溶：有些思考在地下改道</span><span>—</span><span>冰碛：经验会留下重量，也留下位置</span><span>—</span><span>三角洲：汇合之后，形成新的空间</span></section><section className="how"><div className="how-intro"><div className="section-kicker">THE FOUR CONTINUA</div><h2>四条连续坐标，不把人切成两半</h2><p>每个人都会落在两端之间的某个位置。接近中间并不含糊，通常说明你会看情境调整；人格名称是便于阅读的参照，不是永久边界。</p></div><div className="axis-grid">{axes.map((axis, order) => <article key={axis}><b>0{order + 1}</b><h3>{axisMeta[axis].left}<span>↔</span>{axisMeta[axis].right}</h3><p>{axisMeta[axis].description}</p></article>)}</div></section><section className="method"><div className="method-card"><Mountain/><h3>结果怎样产生</h3><p>每个维度由7—8道题加权平均，并穿插反向题。系统不会在50分处把你硬切成两类，而会把四维坐标与16个类型中心比较，选择距离最近的一种，同时保留相邻类型。</p></div><div className="method-card"><Database/><h3>关于作答记录</h3><p>网站不询问姓名、电话或邮箱。后台只保存随机会话编号、各题选择、每题停留时间、四维分数和最终类型，用于检查题目是否清楚、量表表现是否稳定。</p></div></section></>}
    {screen === "quiz" && <section className="quiz-shell"><header className="quiz-head"><div><span>FIELD NOTES / 作答手记</span><b>{String(index + 1).padStart(2, "0")} <i>/ {questions.length}</i></b></div><div className="progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }}/></div></header><div className="question-card"><div className="question-mark">{axisMeta[current.axis].short}</div><p className="question-meta">按平时习惯作答，中间位置同样是有效答案</p><h2>{current.text}</h2><div className="slider-labels"><span>{current.left}</span><span>{current.right}</span></div><input aria-label="回答滑杆" type="range" min="0" max="100" step="1" value={answers[current.id] ?? 50} onChange={(event) => setAnswers((value) => ({ ...value, [current.id]: Number(event.target.value) }))}/><div className="ticks ticks-five">{[0, 25, 50, 75, 100].map((value) => <button key={value} className={(answers[current.id] ?? 50) === value ? "active" : ""} onClick={() => setAnswers((answer) => ({ ...answer, [current.id]: value }))}>{value === 0 ? "更接近左侧" : value === 50 ? "看情况" : value === 100 ? "更接近右侧" : "·"}</button>)}</div><div className="quiz-actions"><button onClick={previous}><ChevronLeft/> 上一题</button><button className="primary" disabled={answers[current.id] === undefined} onClick={next}>{index === questions.length - 1 ? "查看结果" : "下一题"} <ArrowRight/></button></div></div><p className="quiet-note"><Timer/> 每题停留时间仅用于检查题目是否容易理解，不参与计分。</p></section>}
    {screen === "result" && <section className="result-page"><div className="result-hero"><div className="result-avatar"><MiniAvatar type={match.primary} large/><div className="map-orbit"/></div><div className="result-copy"><div className="eyebrow">YOUR INNER GEOGRAPHY · {match.confidence}</div><div className="result-code">{match.primary.english}</div><h1>{match.primary.name}</h1><h4>相邻类型：{match.adjacent.name} · {match.adjacent.english}</h4><p>{shortLead(match.primary.overview)}</p><button className="primary" onClick={startQuiz}><RotateCcw/> 再答一次</button><div className={`submission-status ${submissionStatus}`} aria-live="polite">{submissionStatus === "saving" && "正在保存本次作答记录…"}{submissionStatus === "saved" && "本次作答记录已保存"}{submissionStatus === "error" && <><span>记录暂未保存，答案已留在本机。</span><button onClick={retrySubmission}>重新保存</button></>}</div></div></div><div className="result-grid"><article className="story-card"><span>总体描述</span><h3>你可能会在这些地方认出自己</h3><p>{match.primary.overview}</p></article><article className="insight-card"><span>日常状态</span><h3>聊天、工作与临时变化</h3><p>{match.primary.daily}</p></article><article className="profile-card caution"><span>优势与压力</span><h3>长处怎样变成负担</h3><p>{match.primary.strengthsAndStuck}</p></article><article className="insight-card"><span>关系与工作</span><h3>你怎样建立信任</h3><p>{match.primary.relationsAndWork}</p></article><article className="profile-card geography-card"><span>地理解释</span><h3>{match.primary.name}为什么与你相近</h3><p>{match.primary.geography}</p></article><article className="story-card closing-card"><span>留给你的句子</span><p>{match.primary.closing}</p></article><section className="evidence-section"><span>四个连续维度</span><h2>比类型名称更重要的，是你在四条坐标上的位置</h2><p className="evidence-intro">以下文字依据30道生活情境题生成。分数越接近两端，表示那种倾向出现得越稳定；接近中点，则说明你更常依据情境切换。</p><div className="evidence-grid">{axes.map((axis) => { const reading = axisReading(axis, axisScores[axis]); return <article key={axis}><b>{Math.round(axisScores[axis])}</b><small>{axisMeta[axis].left} ↔ {axisMeta[axis].right}</small><h3>{reading.title}</h3><p>{reading.text}</p></article>; })}</div></section><article className="scores-card"><span>你的四维位置</span>{axes.map((axis) => <div className="score" key={axis}><div><b>{axisMeta[axis].left}</b><b>{axisMeta[axis].right}</b></div><div className="score-bar"><i style={{ left: `${axisScores[axis]}%` }}/></div><small>{axisMeta[axis].description} · {axisScores[axis].toFixed(1)} / 100</small></div>)}</article></div><p className="disclaimer">GEO/TYPE用于自我观察，不用于心理诊断、招聘筛选或高风险决策。人的状态会随经历和环境变化，一次结果不必成为永久定义。</p></section>}
    {screen === "atlas" && <section className="atlas">
      <header className="atlas-head"><div className="section-kicker">THE COMPLETE FIELD GUIDE</div><h1>十六型地理人格图鉴</h1><p>每一种名称都来自真实地理过程。点开一张人物卡，看看地貌怎样形成，也看看这种形成方式为什么会像一种生活习惯。</p><div className="atlas-meta"><span>16种地理人格</span><span>4条连续坐标</span><span>真实地理机制</span></div><button className="primary" onClick={startQuiz}>看看我更接近哪一种 <ArrowRight/></button></header>
      <div className="type-grid">{geoTypes.map((type) => <button className="type-card" key={type.id} onClick={() => setSelectedType(type)}><div className="type-card-top"><MiniAvatar type={type}/><span className="type-order">{String(type.order).padStart(2, "0")}</span></div><div className="type-card-copy"><span className="type-english">{type.english}</span><h3>{type.name}</h3><p>{shortLead(type.overview)}</p><div className="type-axis-row">{axes.map((axis) => <small key={axis}>{centerLabel(axis, type.center[axis])}</small>)}</div><em>打开类型档案 <ArrowRight size={14}/></em></div></button>)}</div>
      <div className="source-note"><h2>这些名字从哪里来</h2><p>内容依据USGS、NOAA、NASA、美国国家公园管理局与美国林务局公开资料整理。这里借用的是溶蚀、搬运、沉积、侵蚀、交换等真实过程，不把地貌外观直接等同性格。</p><a href="https://pubs.usgs.gov/circ/circ1139/htdocs/natural_processes_of_ground.htm" target="_blank" rel="noreferrer">USGS</a><a href="https://oceanservice.noaa.gov/education/" target="_blank" rel="noreferrer">NOAA</a><a href="https://science.nasa.gov/sun/auroras/" target="_blank" rel="noreferrer">NASA</a><a href="https://www.nps.gov/subjects/geology/" target="_blank" rel="noreferrer">NPS</a><a href="https://research.fs.usda.gov/" target="_blank" rel="noreferrer">USDA Forest Service</a></div>
      {selectedType && <div className="atlas-modal-backdrop" onClick={() => setSelectedType(null)}><section className="atlas-modal" role="dialog" aria-modal="true" aria-labelledby="atlas-dialog-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="关闭类型档案" onClick={() => setSelectedType(null)}><X/></button><div className="modal-hero"><MiniAvatar type={selectedType} large/><div><span>{selectedType.english} · {String(selectedType.order).padStart(2, "0")}</span><h2 id="atlas-dialog-title">{selectedType.name}</h2><p>{selectedType.overview}</p><div className="modal-axis-row">{axes.map((axis) => <small key={axis}>{centerLabel(axis, selectedType.center[axis])}</small>)}</div></div></div><div className="modal-content-grid"><article><span>日常状态</span><p>{selectedType.daily}</p></article><article><span>优势与压力</span><p>{selectedType.strengthsAndStuck}</p></article><article><span>关系与工作</span><p>{selectedType.relationsAndWork}</p></article><article className="modal-geography"><span>地理机制</span><p>{selectedType.geography}</p></article></div><blockquote>{selectedType.closing}</blockquote><button className="primary" onClick={() => { setSelectedType(null); startQuiz(); }}>开始作答 <ArrowRight/></button></section></div>}
    </section>}
    <footer><div className="brand"><span>GEO</span><b>/TYPE</b><small>地格志</small></div><p>人格是地图，不是边界。© 2026 GEO/TYPE</p></footer>
  </main>;
}

