import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "content/geotype-content-v2.md"), "utf8");

const axisNames = ["栖居—行旅", "沉积—抬升", "界线—过渡", "定势—流变"];
const axisKeys = { "栖居—行旅": "journey", "沉积—抬升": "uplift", "界线—过渡": "transition", "定势—流变": "flux" };
const axisDefinitions = {};
for (const name of axisNames) {
  const match = source.match(new RegExp(`### ${name.replace("—", " ↔ ")}\\r?\\n\\r?\\n([\\s\\S]*?)(?=\\r?\\n### |\\r?\\n## )`));
  if (!match) throw new Error(`Missing axis definition: ${name}`);
  axisDefinitions[axisKeys[name]] = match[1].trim();
}

const questionPattern = /^\*\*(\d{2})｜([^*]+)\*\*\s+(.*?)。左端：(.*?)；右端：(.*?)。维度：(.*?)。计分：(.*?)。反向：(是|否)。测量：(.*?)。权重：([\d.]+)。$/gm;
const questions = [];
for (const match of source.matchAll(questionPattern)) {
  const [, id, title, scene, left, right, axisName, direction, reverse, construct, weight] = match;
  questions.push({
    id: Number(id),
    title,
    text: scene,
    left,
    right,
    axis: axisKeys[axisName],
    direction,
    reverse: reverse === "是",
    construct,
    weight: Number(weight),
  });
}
if (questions.length !== 30) throw new Error(`Expected 30 questions, found ${questions.length}`);

const typeRows = [...source.matchAll(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| (\d+) \/ (\d+) \/ (\d+) \/ (\d+) \|$/gm)];
if (typeRows.length !== 16) throw new Error(`Expected 16 type centers, found ${typeRows.length}`);

const types = typeRows.map((row, portrait) => {
  const [, order, name, english, journey, uplift, transition, flux] = row;
  const heading = `### ${name.trim()}｜${english.trim()}`;
  const start = source.indexOf(heading);
  const end = source.indexOf("\n### ", start + heading.length);
  const sectionEnd = end === -1 ? source.indexOf("\n## 5.", start) : end;
  const body = source.slice(start + heading.length, sectionEnd).trim();
  const paragraphs = body.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length !== 6) throw new Error(`${name.trim()} expected 6 paragraphs, found ${paragraphs.length}`);
  return {
    id: english.trim().toLowerCase(),
    order: Number(order),
    name: name.trim(),
    english: english.trim(),
    portrait,
    center: { journey: Number(journey), uplift: Number(uplift), transition: Number(transition), flux: Number(flux) },
    overview: paragraphs[0],
    daily: paragraphs[1],
    strengthsAndStuck: paragraphs[2],
    relationsAndWork: paragraphs[3],
    geography: paragraphs[4],
    closing: paragraphs[5],
  };
});

await writeFile(
  resolve(root, "app/geotype-content.generated.json"),
  `${JSON.stringify({ axisDefinitions, questions, types }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${questions.length} questions and ${types.length} personality types.`);

