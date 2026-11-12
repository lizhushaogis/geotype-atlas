"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, Compass, Database, Map, Mountain, RotateCcw, Sparkles, Timer } from "lucide-react";

type Axis = "RH" | "LA" | "CO" | "TG";
type Question = { id: number; axis: Axis; text: string; left: string; right: string; reverse?: boolean };

const questions: Question[] = [
  { id: 1, axis: "RH", text: "参加一个几乎没有熟人的聚会时，你通常会……", left: "主动找人聊天，在互动中逐渐进入状态", right: "先观察一阵，遇到真正想聊的人再靠近" },
  { id: 2, axis: "LA", text: "第一次接触一个新领域时，你更希望先得到……", left: "几个清楚的例子，以及可以马上尝试的方法", right: "一套总体框架，理解它为什么成立" },
  { id: 3, axis: "CO", text: "团队对一个重要决定争执不下时，你更看重……", left: "标准是否一致，理由能否经得起反驳", right: "这个决定会怎样影响其中的每个人" },
  { id: 4, axis: "TG", text: "准备一次期待已久的旅行时，你更偏好……", left: "只确定关键事项，其余根据当时的感受决定", right: "提前安排主要行程，减少临时的不确定性" },
  { id: 5, axis: "RH", text: "连续参加几次社交活动后，你通常更想……", left: "暂时不见人，独自恢复精力", right: "继续和喜欢的人相处，延续当下的状态", reverse: true },
  { id: 6, axis: "LA", text: "别人向你描述一个复杂问题时，你更容易抓住……", left: "具体发生了什么，以及哪些事实可以确认", right: "这些现象之间可能存在的模式和原因" },
  { id: 7, axis: "CO", text: "面对一个重大选择，你更容易被哪种理由说服？", left: "它逻辑完整，长期来看更合理", right: "它符合自己的价值，也不会辜负重要的人" },
  { id: 8, axis: "TG", text: "原定计划突然无法继续时，你通常会……", left: "很快接受变化，边做边寻找新的可能", right: "重新排列步骤，尽快恢复清楚的节奏" },
  { id: 9, axis: "RH", text: "在多人讨论中，你更常……", left: "先听和思考，形成比较完整的想法再开口", right: "通过说出来和回应别人，逐渐弄清自己的想法", reverse: true },
  { id: 10, axis: "LA", text: "学习一个陌生概念时，你更喜欢……", left: "先理解原理和模型，再回头看具体例子", right: "从真实案例开始，再总结其中的规律", reverse: true },
  { id: 11, axis: "CO", text: "朋友做了一个并不划算、但对他很有意义的决定，你会先……", left: "理解这件事对他的意义，再讨论实际代价", right: "帮助他看清风险，并寻找更可行的方案", reverse: true },
  { id: 12, axis: "TG", text: "你的文件、物品和日常安排通常……", left: "有固定的位置和顺序，找东西比较省心", right: "看起来未必整齐，但自己知道大致在哪里", reverse: true },
  { id: 13, axis: "RH", text: "刚加入一个新团队时，你更可能……", left: "很快参与对话，通过合作认识大家", right: "先熟悉工作方式，再慢慢建立稳定关系" },
  { id: 14, axis: "LA", text: "收到一个要求很模糊的任务时，你会先……", left: "确认目标、限制和交付标准", right: "思考它还可以被理解成哪些更有意思的问题" },
  { id: 15, axis: "CO", text: "必须指出一个人的错误时，你更在意……", left: "把问题说准确，避免同样的错误再次发生", right: "让对方能听进去，并保留彼此的信任" },
  { id: 16, axis: "TG", text: "周末突然空出半天，你通常会……", left: "暂时不做决定，看看当时最想做什么", right: "选一件值得做的事，把时间安排好" },
  { id: 17, axis: "RH", text: "独处一整天之后，你通常会觉得……", left: "状态恢复了，还想继续保留一点安静", right: "已经待得够久了，想和人说说话", reverse: true },
  { id: 18, axis: "LA", text: "判断一段解释是否可信时，你更看重……", left: "是否具体、可核实，并清楚说明适用范围", right: "是否抓住关键联系，能解释更多现象" },
  { id: 19, axis: "CO", text: "当时间和资源都很有限时，你更倾向……", left: "优先做总体收益最大的事情", right: "先照顾处境最困难、最容易被忽略的人" },
  { id: 20, axis: "TG", text: "距离截止日期还有很久时，你通常会……", left: "先保留选择，等信息更充分后再确定", right: "尽早定下方案，分阶段推进并提前完成" },
  { id: 21, axis: "RH", text: "遇到一个很难想清楚的问题时，你更喜欢……", left: "自己待一会儿，让想法慢慢变得清楚", right: "找值得信任的人聊，在交流中找到重点", reverse: true },
  { id: 22, axis: "LA", text: "读完一份内容很多的报告后，你更容易记住……", left: "它揭示的趋势、核心观点和潜在影响", right: "关键数据、具体案例和明确结论", reverse: true },
  { id: 23, axis: "CO", text: "评价一个方案时，你的第一反应更接近……", left: "它是否尊重了相关人的真实需要？", right: "它的逻辑是否成立，执行是否有效？", reverse: true },
  { id: 24, axis: "TG", text: "开始一个自己很感兴趣的新项目时，你更喜欢……", left: "先把阶段、节点和完成标准设定清楚", right: "先做起来，让方向在过程中逐渐成形", reverse: true },
  { id: 25, axis: "RH", text: "在一个成员背景差异很大的合作中，你更可能……", left: "主动连接不同的人，让交流尽快发生", right: "先理解各自的角色，再建立少而稳的联系" },
  { id: 26, axis: "LA", text: "当两份分析得出不同结论时，你首先会关注……", left: "它们是否暗示了一个尚未被发现的新解释", right: "数据、假设和分析过程具体在哪里不同", reverse: true },
  { id: 27, axis: "CO", text: "一项统一规则对少数人明显不公平时，你更倾向……", left: "先维护规则的一致性，再通过正式程序修改", right: "先处理具体的不公平，再考虑怎样完善规则" },
  { id: 28, axis: "TG", text: "接到一个没有现成做法的任务时，你更愿意……", left: "先尝试几个方向，从反馈中确定方法", right: "先建立步骤和判断标准，再开始执行" },
  { id: 29, axis: "RH", text: "经历一件对自己影响很大的事情后，你更常通过什么理解它？", left: "讲给信任的人听，在回应中重新认识自己", right: "独自整理和回想，等感受慢慢沉淀" },
  { id: 30, axis: "LA", text: "看到一件看似普通的事情时，你更自然地注意到……", left: "它具体是怎样发生的，由哪些因素组成", right: "它背后还暗示着什么，以及可能如何发展" },
];

const types: Record<string, { element: string; title: string; role: string; portrait: number; blurb: string; strengths: string[]; watch: string; habitat: string; portraitText: string; relation: string; growth: string }> = {
  RLCT: { element: "潮汐三角洲", title: "潮汐绘图师", role: "TIDE CARTOGRAPHER", portrait: 0, blurb: "你像河流抵达大海前的最后一次自由：不执着于唯一河道，而是在现实地势中不断寻找可以抵达的方向。", strengths: ["迅速读取现场", "让陌生关系开始流动", "在限制中找到支流"], watch: "支流太多会耗散水量，真正重要的方向需要一条稳定主槽。", habitat: "田野调查、跨团队协作、快速变化的现实问题", portraitText: "三角洲并不是犹豫不决，而是河流对复杂地形的聪明回答。你的外向、务实、理性与开放，让你习惯先触碰现实，再边走边修正地图。", relation: "你用行动建立信任。对你而言，一起走过一段泥泞，比交换十句漂亮承诺更可靠。你能把人群组织成水系，但不喜欢被过早筑坝。", growth: "学会为最重要的关系与目标留下稳定河床。自由并非永远改道，而是知道何时汇流。" },
  RLGT: { element: "季风与信风", title: "季候传信者", role: "MONSOON HERALD", portrait: 1, blurb: "你是按季节归来的风：热烈，却不混乱；善于把一群人的期待吹成同一个方向。", strengths: ["调动群体能量", "察觉现实气候", "把计划变成节律"], watch: "不是每一片云都要被编入气候表，偶然的阵雨也有它的美。", habitat: "组织运营、公共活动、需要节奏感的协作场域", portraitText: "季风的浪漫，在于它跨越海陆，却从不忘记归期。你既向外连接，又信任事实和秩序，擅长把零散行动组织成可预期的季节。", relation: "你让人感到“事情会被好好接住”。你的关心常以安排、提醒和实际解决呈现，像雨季来临前已经修好的屋檐。", growth: "允许一些关系没有日程，一些情绪没有立刻的解决方案。风也需要在山谷里自由转向。" },
  RLOT: { element: "雨林树冠", title: "共生采集者", role: "CANOPY KEEPER", portrait: 2, blurb: "你像雨林最上层的树冠：向阳生长，也为许多微小生命留下荫蔽与通道。", strengths: ["感知具体需要", "营造归属与温度", "让差异形成共生"], watch: "高多样性不是无限承载，别把所有人的天气都变成自己的湿度。", habitat: "社群、教育、服务设计、跨文化团队", portraitText: "雨林不是一棵树的胜利，而是无数关系长期协商出的丰盛。你从真实互动获得能量，相信人的感受，也愿意随情境调整，因此常成为群体中的生态连接者。", relation: "你记得谁怕冷、谁没被听见、谁需要一小块光。你的爱不是宏大宣言，而是让不同生命都能在场。", growth: "为自己的根系划出保护区。真正的共生，不要求你成为所有人的气候。" },
  RLOG: { element: "灯塔港湾", title: "泊岸守灯人", role: "LANTERN HARBOR", portrait: 3, blurb: "你是一座亮着灯的港：既欢迎远船，也清楚潮位、泊位和归航时间。", strengths: ["稳定而热情", "维护关系秩序", "把照顾落到细节"], watch: "港口也有封航检修日，你不必永远处于吞吐高峰。", habitat: "团队管理、社区治理、需要长期信任的服务系统", portraitText: "港湾的价值不在于留住所有船，而在于让远行者知道世上有可归之处。你向外、务实、重情且有结构，擅长把温暖变成可靠的基础设施。", relation: "你给予的安全感很具体：一盏灯、一张清单、一次准时出现。别人也许先记住你的能干，后来才读懂那其实是深厚的在意。", growth: "不要用忙碌证明自己不可替代。灯塔照亮航道，却不需要替每艘船航行。" },
  RACT: { element: "跨洋暖流", title: "暖流逐浪者", role: "WARM CURRENT", portrait: 4, blurb: "你像一股跨越纬度的暖流，把远方的热量、种子与可能性带到陌生海岸。", strengths: ["跨域联想", "感染与启发他人", "顺势发现新航道"], watch: "灵感能跨洋，承诺却要靠岸；别让所有美好都停在流动状态。", habitat: "创新、创业、创意策划、跨学科探索", portraitText: "洋流看似随性，背后却受风、密度与地转偏向共同塑造。你善于向外探索、捕捉抽象关联、理性试验并保留开放，因此总能把不同海域连接起来。", relation: "你通过共享新鲜世界与人亲近。和你在一起，关系像被带到新的纬度；但对方有时也需要一处能确认水温的岸。", growth: "为最重要的灵感设下观测站。持续追踪，才能让一股暖流真正改变气候。" },
  RAGT: { element: "星夜丝路", title: "星驿领航者", role: "STARRY CARAVAN", portrait: 5, blurb: "你把远方的愿景译成驿站、补给与可抵达的路，让星光不只适合仰望，也能用于辨认方向。", strengths: ["远景规划", "组织复杂合作", "让抽象目标可行"], watch: "路线图太漂亮时，也要问问同行者和骆驼是否需要停一晚。", habitat: "战略、产品规划、国际协作、长期项目", portraitText: "商路不是地表的一条线，而是信任、知识与物产经过千百次往返后留下的空间记忆。你兼具连接力、想象力、逻辑与结构，天然会把远景变成路网。", relation: "你愿意为共同未来投入很多，但有时比同行者更早看见终点。记得回头，让他们也能在星图上找到自己的位置。", growth: "别让使命吞没沿途。真正伟大的远征，不只抵达目的地，也保全同行人的体力与故事。" },
  RAOT: { element: "星屿群岛", title: "星屿叙事者", role: "CONSTELLATION ISLES", portrait: 6, blurb: "你相信分散的岛屿并不孤独——只要有人看见潮汐、航线与夜空中那条未画出的连线。", strengths: ["诗性联想", "共情不同世界", "用故事建立航线"], watch: "航线太多会稀释潮汐，最珍贵的岛值得固定班次。", habitat: "内容、品牌、艺术协作、社会创新", portraitText: "群岛的整体性不在陆地相连，而在海与人持续往返。你从人群获得灵感，擅长象征思维，以价值感作判断，并为偶然相遇保留空间。", relation: "你愿意进入别人的岛屿，学习当地语言，再带回一枚不属于自己的贝壳。你的理解很动人，但也容易忘记自己同样需要被抵达。", growth: "给灵感建立少量长期航线。浪漫不是永远漂泊，而是有人知道你会在哪个潮汐回来。" },
  RAOG: { element: "双河汇城", title: "汇流筑城者", role: "CONFLUENCE CITY", portrait: 7, blurb: "你像两条大河交汇处生长出的城市：容纳差异，并把共同愿景写进桥梁、街巷与公共空间。", strengths: ["愿景领导", "整合多方价值", "推动系统改变"], watch: "宏大的城市也要留一条无须绩效的安静小巷。", habitat: "组织变革、城市创新、公益与公共领导", portraitText: "汇流之地天然复杂：水系、人口、贸易与记忆同时叠加。你向外连接、面向可能、关心人，并愿意建立秩序，因此常把理想变成一套可居住的系统。", relation: "你爱人的方式，是认真想象“我们可以共同生活成什么样”。只是有时，亲密需要的不是城市蓝图，而是一起坐在河阶上吹风。", growth: "让系统服务生命，而不是让生命适应系统。保留不可规划的空地，它会长出真正的城市感。" },
  HLCT: { element: "赤色层理峡谷", title: "层理辨读者", role: "STRATA CANYON", portrait: 8, blurb: "你不急着穿越峡谷；你会先看岩壁，让每一道不整合面讲完它被时间打断的故事。", strengths: ["深度分析", "独立验证", "在压力下保持清醒"], watch: "别只研究侵蚀机制，也看看同行的人是否已经口渴。", habitat: "研究、工程、数据分析、复杂故障排查", portraitText: "峡谷之深，来自水对漫长时间的坚持。你偏好内在沉淀、具体证据、理性判断与开放探索，能从表面混乱中读出清楚的因果层序。", relation: "你不轻易靠近，但一旦把某人写进自己的地层，就很难被风化。你表达在意的方式常是认真理解问题，而非制造热烈气氛。", growth: "把感受也当作一种有效观测。并非所有重要信号都能被量尺直接读出。" },
  HLGT: { element: "蓝冰冰川", title: "蓝冰纪年官", role: "BLUE ICE", portrait: 9, blurb: "你把岁月压成透明的冰层：安静、精确，每一粒远古尘埃都有编号，也有来处。", strengths: ["严谨可靠", "保存细节与历史", "守住质量边界"], watch: "稳定不是冻结；冰川也在移动，只是拒绝被催稿。", habitat: "质量、档案、财务、精密技术与长期研究", portraitText: "冰芯记录大气，冰碛记录路径。你相信真实细节、独立判断与清楚结构，因此能保存别人略过的证据，让过去成为可靠的参照系。", relation: "你的感情像蓝冰，表面克制，内部保存着很久以前的气候。真正靠近你的人，会发现你记得他们随口说过的每个小坐标。", growth: "允许新的季节改变旧路线。可靠不意味着永远沿用同一条冰川槽谷。" },
  HLOT: { element: "云上梯田", title: "层水育田者", role: "CLOUD TERRACE", portrait: 10, blurb: "你把陡峭生活修成一层层可耕作的温柔，让水慢下来，也让人有地方安放日常。", strengths: ["细腻体察", "耐心维护", "把关心做成具体环境"], watch: "别总把自己的水让到下一层，你也需要一块被灌溉的田。", habitat: "照护、教育支持、手作、体验与社区设计", portraitText: "梯田不是对山的征服，而是人顺着等高线与坡度长期协商的结果。你内敛、务实、重视人的处境，又能灵活调整，善于把爱做成可持续的微小工程。", relation: "你很少高声宣布付出，却会默默修好漏水的渠。你的亲密感来自重复而可靠的日常，不来自一场盛大的烟火。", growth: "让别人也参与修渠。被照顾不是破坏地形，而是让水循环重新完整。" },
  HLOG: { element: "雪线高原", title: "雪线守望者", role: "SNOWLINE PLATEAU", portrait: 11, blurb: "你把重要的价值放在高处守望，那里空气稀薄、视野辽阔，承诺却能保存很久。", strengths: ["责任与定力", "守护共同价值", "周全地安排长期生活"], watch: "原则是坐标，不必成为海拔门槛；并非每个人都已适应高原。", habitat: "制度建设、教育、公共服务、长期共同体", portraitText: "雪线是气候、地形与时间共同写下的边界。你向内沉淀、看重现实，也以人的价值和稳定结构来判断世界，因此常成为不轻易动摇的守望者。", relation: "你不会让很多人进入核心高地，但一旦接纳，就愿意承担长久的风雪。你需要的是可信的同行，而非短暂的热闹。", growth: "偶尔下到河谷，听听更低海拔的语言。价值若要被共享，也需要氧气与道路。" },
  HACT: { element: "火山新生岛", title: "熔岩造岛者", role: "NEWBORN ISLAND", portrait: 12, blurb: "你像海底火山在无人注视处重塑地壳：沉默很久，然后带着一座从未存在过的岛浮出海面。", strengths: ["原创思考", "独立实验", "从根部改写问题"], watch: "喷发很壮观，但请给靠近的人一张疏散图和一条上岛的路。", habitat: "研发、独立创作、艺术实验、前沿技术", portraitText: "新岛不是凭空出现，而是深处压力、物质与漫长积累终于越过海平面。你内向、抽象、理性又开放，常在别人看不见的地方孕育全新框架。", relation: "你珍惜能尊重沉默的人。对你而言，亲密不是不断交谈，而是有人愿意在岛还没浮出时，相信海面下正在发生事情。", growth: "让新大陆尽早出现一点可见的岸。分享半成品，不会削弱创造，反而能让生命更早登陆。" },
  HAGT: { element: "高地天文台", title: "高轨观测者", role: "HIGH ORBIT", portrait: 13, blurb: "你在远离灯害的高地校准仪器，把遥远微光整理成一张可供后来者辨路的星图。", strengths: ["系统洞察", "长期设计", "将复杂化为结构"], watch: "模型不是宇宙本身；再精确的星图，也要偶尔下山采样。", habitat: "系统架构、战略研究、科学、长期设计", portraitText: "天文台选择高处与安静，不是为了远离世界，而是为了看见更大的世界。你内省、抽象、理性且有结构，擅长跨越时间尺度安排问题。", relation: "你表达感情的方式像校准望远镜：认真、克制，却希望看得足够真实。你需要能尊重独处，也愿意分享远景的人。", growth: "给宏大视野接上日常步道。真正可用的星图，必须有人能从村庄出发读懂它。" },
  HAOT: { element: "新月沙丘", title: "风纹听梦者", role: "CRESCENT DUNE", portrait: 14, blurb: "你能在稀少的信号里听见遥远回声，也知道沙丘从不静止——它只是把移动写得很慢。", strengths: ["深层共情", "象征与诗性思维", "忠于内在价值"], watch: "绿洲要被标在地图上；别让真实需求永远只存在于诗里。", habitat: "写作、人文研究、艺术、使命驱动的温柔团队", portraitText: "新月沙丘由风塑造，却有自己的迎风坡与背风坡。你向内、想象丰富、重视意义并保持开放，常能感知他人忽略的情绪地貌。", relation: "你并不需要许多人理解，只希望少数人愿意在夜里坐下，听完风把故事讲完。你的深情含蓄，却会在细节里留下长长风纹。", growth: "把内在景观译成别人可以抵达的坐标。被理解需要一点可见的路标。" },
  HAOG: { element: "分水岭湿地", title: "分水岭译者", role: "WATERSHED", portrait: 15, blurb: "你站在两套水系将要分开的地方，理解各自的去向，也守护边界之间最脆弱的湿地。", strengths: ["洞察人心与系统", "整合复杂价值", "温和而坚定地推进"], watch: "调和不同流域时，也要清楚标出自己的分水岭。", habitat: "组织咨询、文化沟通、教育、社会与生态议题", portraitText: "分水岭不是墙，而是水从此走向不同世界的细微高处。你内省、面向可能、重视人的处境，也愿意建立长期秩序，因此擅长翻译不同立场。", relation: "你常能理解冲突双方看不见的部分，也容易把自己留在中间地带。真正亲密的人，会尊重你的边界，而非只需要你的调和能力。", growth: "不必让所有水都流向和解。有些清晰的分开，正是对两个流域的保护。" },
};

const axisMeta: Record<Axis, { left: string; right: string; leftName: string; rightName: string; desc: string }> = {
  RH: { left: "R", right: "H", leftName: "Range 广域", rightName: "Haven 栖湾", desc: "能量更常从外部流域，还是内部栖地获得" },
  LA: { left: "L", right: "A", leftName: "Lithos 岩感", rightName: "Aether 天象", desc: "偏好可触的事实，还是模式、联想与可能性" },
  CO: { left: "C", right: "O", leftName: "Compass 罗盘", rightName: "Oasis 绿洲", desc: "决策优先一致逻辑，还是价值与人的处境" },
  TG: { left: "T", right: "G", leftName: "Tide 潮汐", rightName: "Grid 经纬", desc: "偏好顺势开放，还是结构、计划与收束" },
};

const axisDeep: Record<Axis, { leftTitle: string; rightTitle: string; leftText: string; rightText: string; balanceText: string }> = {
  RH: { leftTitle: "你从世界的回声中获得能量", rightTitle: "你从内在的安静中恢复完整", leftText: "你往往要先进入关系，才能真正听见自己的想法。互动对你不是消耗，而是一面会回应的镜子；你通过现场、表情和共同经历确认自己正在生活。", rightText: "你需要把外界暂时关小，才能分辨哪些感受真正属于自己。独处不是退缩，而是一种整理：只有当内在重新变得清楚，你才愿意带着完整的自己回到关系里。", balanceText: "你既能从交流中被点亮，也需要独处完成消化。你不是简单地“外向或内向”，而是会根据关系质量决定开放程度：浅层热闹未必补充你，真正的共鸣却能持续很久。" },
  LA: { leftTitle: "你相信可触摸的事实会说话", rightTitle: "你总在现实背后寻找更大的图案", leftText: "你尊重事物本来的纹理，不急着用漂亮理论覆盖它。具体经验、明确边界与可验证的细节，让你能在别人仍沉迷想象时看见真正可行的下一步。", rightText: "你很少只接受事物的表面含义。一个细节会把你带向更远的关联，你关心的不只是“发生了什么”，还有它为何发生、将通向哪里，以及能否被重新理解。", balanceText: "你能够在细节与整体之间往返：既不愿让宏大解释脱离事实，也不满足于只罗列现象。你最好的理解常发生在具体材料与抽象框架互相修正的时候。" },
  CO: { leftTitle: "你的罗盘指向一致与可解释", rightTitle: "你的判断始终保留人的尺度", leftText: "你希望一个决定能够被清楚说明，也能在相似情境中保持一致。理性对你不是冷漠，而是一种公平：不让一时情绪替代证据，不让亲疏关系偷偷改变标准。", rightText: "你认为没有脱离具体生命的正确答案。规则与效率固然重要，但如果一个方案让真实的人承受无法被看见的代价，它就仍然需要被重新判断。", balanceText: "你会同时询问“这是否合理”与“这对人意味着什么”。你的难处不是缺乏立场，而是看见了两种正当性；成熟之处在于知道何时守住原则，何时为具体处境留出例外。" },
  TG: { leftTitle: "你让道路在行走中出现", rightTitle: "你用结构保护真正重要的事情", leftText: "你相信过早确定会遮蔽尚未出现的可能。开放并不等于没有方向，而是愿意让新信息改变方向；你擅长在变化中保持活力，也能容忍一段时间的未完成。", rightText: "你通过计划把意图变成现实。结构对你不是束缚，而是一种承诺：既然某件事重要，就值得为它安排时间、顺序和边界，不把完成完全交给偶然。", balanceText: "你既希望保留弹性，也需要足够的结构安心行动。你真正追求的不是绝对自由或绝对控制，而是“可调整的秩序”——方向清楚，但仍允许现实修改路线。" },
};

function axisReading(axis: Axis, score: number) {
  const d = axisDeep[axis];
  if (Math.abs(score - 4) < .55) return { title: "你生活在两端之间的过渡带", text: d.balanceText };
  return score < 4 ? { title: d.leftTitle, text: d.leftText } : { title: d.rightTitle, text: d.rightText };
}

function MiniAvatar({ code, large = false }: { code: string; large?: boolean }) { const t = types[code]; const x = (t.portrait % 4) * 33.333; const y = Math.floor(t.portrait / 4) * 33.333; return <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ backgroundPosition: `${x}% ${y}%` }}><i>{code}</i></div>; }

type SubmissionPayload = {
  sessionId: string;
  startedAt: string;
  completedAt: string;
  answers: Record<number, number>;
  questionTimesMs: Record<number, number>;
  resultCode: string;
  axisScores: Record<Axis, number>;
};

function submitResponse(payload: SubmissionPayload) {
  const config = window as Window & {
    GEOTYPE_SUBMISSION_ENDPOINT?: string;
    GEOTYPE_SUPABASE_URL?: string;
    GEOTYPE_SUPABASE_PUBLISHABLE_KEY?: string;
  };
  if (config.GEOTYPE_SUPABASE_URL && config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY) {
    const completed = new Date(payload.completedAt).getTime();
    const started = new Date(payload.startedAt).getTime();
    return fetch(`${config.GEOTYPE_SUPABASE_URL}/rest/v1/submissions`, {
      method: "POST",
      headers: {
        apikey: config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${config.GEOTYPE_SUPABASE_PUBLISHABLE_KEY}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({
        session_id: payload.sessionId,
        started_at: payload.startedAt,
        completed_at: payload.completedAt,
        answers: payload.answers,
        question_times: payload.questionTimesMs,
        result_code: payload.resultCode,
        axis_scores: payload.axisScores,
        total_duration_ms: Math.max(0, completed - started),
        user_agent: navigator.userAgent,
      }),
    });
  }
  return fetch(config.GEOTYPE_SUBMISSION_ENDPOINT || "/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export default function Home() {
  const [screen, setScreen] = useState<"home" | "quiz" | "result" | "atlas">("home");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const enteredAt = useRef(Date.now()); const startedAt = useRef(new Date().toISOString()); const sessionId = useRef("");
  useEffect(() => { sessionId.current ||= crypto.randomUUID(); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [screen]);
  const axisScores = useMemo(() => { const out: Record<Axis, number> = { RH: 4, LA: 4, CO: 4, TG: 4 }; (Object.keys(out) as Axis[]).forEach(axis => { const qs = questions.filter(q => q.axis === axis && answers[q.id]); if (qs.length) out[axis] = qs.reduce((sum, q) => sum + (q.reverse ? 8 - answers[q.id] : answers[q.id]), 0) / qs.length; }); return out; }, [answers]);
  const code = (Object.keys(axisMeta) as Axis[]).map(axis => axisScores[axis] <= 4 ? axisMeta[axis].left : axisMeta[axis].right).join("");
  function startQuiz() { startedAt.current = new Date().toISOString(); sessionId.current = crypto.randomUUID(); enteredAt.current = Date.now(); setAnswers({}); setTimes({}); setIndex(0); setScreen("quiz"); }
  function captureTime(qid: number) { setTimes(prev => ({ ...prev, [qid]: (prev[qid] || 0) + Date.now() - enteredAt.current })); enteredAt.current = Date.now(); }
  async function next() { const q = questions[index]; if (!answers[q.id]) return; const elapsed = Date.now() - enteredAt.current; const finalTimes = { ...times, [q.id]: (times[q.id] || 0) + elapsed }; setTimes(finalTimes); enteredAt.current = Date.now(); if (index < questions.length - 1) setIndex(i => i + 1); else { setScreen("result"); submitResponse({ sessionId: sessionId.current, startedAt: startedAt.current, completedAt: new Date().toISOString(), answers, questionTimesMs: finalTimes, resultCode: code, axisScores }).catch(() => {}); } }
  function previous() { if (index === 0) { setScreen("home"); return; } captureTime(questions[index].id); setIndex(i => i - 1); }
  const current = questions[index]; const result = types[code];

  return <main>
    <nav className="nav"><button className="brand" onClick={() => setScreen("home")}><span>GEO</span><b>/TYPE</b><small>地格志</small></button><div className="nav-links"><button onClick={() => setScreen("atlas")}>16型图鉴</button><button onClick={startQuiz} className="nav-cta">开始测绘 <ArrowRight size={15}/></button></div></nav>
    {screen === "home" && <><section className="hero"><div className="topo-lines"/><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> A FIELD ATLAS OF PERSONALITY</div><h1>你的人格，<br/><em>是哪一种地理奇观？</em></h1><p>把灵魂摊开成一张地图：30 个滑杆问题，沿四条原创地理坐标测绘你的能量来源、感知尺度、判断罗盘与生活节律。最后获得一片与你相似的浪漫地理，以及一位属于它的拟人守望者。</p><div className="hero-actions"><button className="primary" onClick={startQuiz}>开始人格测绘 <ArrowRight/></button><button className="secondary" onClick={() => setScreen("atlas")}>先偷看 16 型</button></div><div className="trust-row"><span><Timer/> 约 5 分钟</span><span><Map/> 30 道滑杆题</span><span><Compass/> 16 种地理人格</span></div></div><div className="hero-art"><img src="geotype-ensemble.png" alt="十六位由地理要素启发的人格角色群像"/><div className="stamp">16<br/><small>GEO TYPES</small></div></div></section><section className="ticker"><span>🌋 新岛不是冲动，是深处积累终于越过海平面</span><span>—</span><span>🧊 冰川也在移动，只是拒绝被催稿</span><span>—</span><span>🌌 星图不是答案，是远行者共享的方向</span></section><section className="how"><div><div className="section-kicker">THE FOUR COORDINATES</div><h2>四条地理坐标，定位你的内在大陆</h2><p>不是套用现成英文，也不是给人格盖章。R/H、L/A、C/O、T/G 都来自地理意象，把连续特质画成一张有比例尺的图。</p></div><div className="axis-grid">{(Object.keys(axisMeta) as Axis[]).map((axis, i) => <article key={axis}><b>0{i+1}</b><h3>{axisMeta[axis].leftName}<span>↔</span>{axisMeta[axis].rightName}</h3><p>{axisMeta[axis].desc}</p></article>)}</div></section><section className="method"><div className="method-card"><Mountain/><h3>更像测绘，不像算命</h3><p>量表把人格视为连续特质，而非非黑即白的箱子。30 题分布在四个维度，包含平衡的正向与反向表述，并用同一维度的多道情境题减少单题偶然性。结果保留四维位置，不只给一个代码。</p></div><div className="method-card"><Database/><h3>答案会去哪儿？</h3><p>你的各题选择、每题停留时长和最终类型会在后台以随机会话编号记录，用于查看整体答题质量；这些数据不会在交互页面展示，也不要求姓名或联系方式。</p></div></section></>}
    {screen === "quiz" && <section className="quiz-shell"><header className="quiz-head"><div><span>FIELD SURVEY / 实地测绘</span><b>{String(index + 1).padStart(2,"0")} <i>/ {questions.length}</i></b></div><div className="progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }}/></div></header><div className="question-card"><div className="question-mark">{current.axis}</div><p className="question-meta">凭第一反应作答 · 没有正确路线</p><h2>{current.text}</h2><div className="slider-labels"><span>{current.left}</span><span>{current.right}</span></div><input aria-label="回答滑杆" type="range" min="1" max="7" step="1" value={answers[current.id] || 4} onChange={e => setAnswers(a => ({ ...a, [current.id]: Number(e.target.value) }))}/><div className="ticks">{[1,2,3,4,5,6,7].map(n => <button key={n} className={(answers[current.id] || 4) === n ? "active" : ""} onClick={() => setAnswers(a => ({ ...a, [current.id]: n }))}>{n === 1 ? "非常像左侧" : n === 4 ? "中间地带" : n === 7 ? "非常像右侧" : "·"}</button>)}</div><div className="quiz-actions"><button onClick={previous}><ChevronLeft/> 上一题</button><button className="primary" onClick={next}>{index === questions.length - 1 ? "生成我的地理人格" : "下一题"} <ArrowRight/></button></div></div><p className="quiet-note"><Timer/> 停留时间正在后台匿名记录，不参与人格计分。</p></section>}
    {screen === "result" && <section className="result-page"><div className="result-hero"><div className="result-avatar"><MiniAvatar code={code} large/><div className="map-orbit"/></div><div className="result-copy"><div className="eyebrow">YOUR INNER GEOGRAPHY</div><div className="result-code">{code}</div><h1>{result.title}</h1><h4>{result.element} · {result.role}</h4><p>{result.blurb}</p><button className="primary" onClick={startQuiz}><RotateCcw/> 重新测绘</button></div></div><div className="result-grid"><article className="story-card"><span>为什么你是这片地理</span><h3>地貌不是比喻的装饰，而是一种形成机制</h3><p>{result.portraitText}</p></article><article className="profile-card"><span>你的优势地貌</span><h3>这片土地如何工作</h3><ul>{result.strengths.map(s => <li key={s}><Check/> {s}</li>)}</ul><div className="habitat"><small>适生环境</small>{result.habitat}</div></article><article className="profile-card caution"><span>地质灾害预警</span><h3>一句温柔的校正</h3><p>“{result.watch}”</p></article><article className="insight-card"><span>你如何与世界相遇</span><h3>关系中的水文过程</h3><p>{result.relation}</p></article><article className="insight-card growth"><span>地貌的下一次演化</span><h3>给未来留一条等高线</h3><p>{result.growth}</p></article><section className="evidence-section"><span>你的四条证据链</span><h2>人格不是四个字母，而是四组持续发生的选择</h2><p className="evidence-intro">下面的解释直接来自你在 30 个生活情境中的连续分数。它们说明这片地理为何会在你身上形成，也保留那些无法被一个类型名称概括的过渡地带。</p><div className="evidence-grid">{(Object.keys(axisMeta) as Axis[]).map(axis => { const reading = axisReading(axis, axisScores[axis]); return <article key={axis}><b>{axis}</b><small>{axisMeta[axis].leftName} ↔ {axisMeta[axis].rightName}</small><h3>{reading.title}</h3><p>{reading.text}</p></article>})}</div></section><article className="scores-card"><span>四维坐标剖面 · 四个字母均来自地理意象</span>{(Object.keys(axisMeta) as Axis[]).map(axis => { const p = ((axisScores[axis]-1)/6)*100; return <div className="score" key={axis}><div><b>{axisMeta[axis].leftName}</b><b>{axisMeta[axis].rightName}</b></div><div className="score-bar"><i style={{left:`${p}%`}}/></div><small>{axisMeta[axis].desc} · 本维度位置 {axisScores[axis].toFixed(1)} / 7</small></div>})}</article></div><p className="disclaimer">GEO/TYPE 是基于连续人格特质设计的原创地理自我探索工具，不套用 MBTI 英文体系，也不替代临床诊断或经过常模验证的专业量表。</p></section>}
    {screen === "atlas" && <section className="atlas"><div className="atlas-head"><div className="section-kicker">THE COMPLETE FIELD GUIDE</div><h1>十六型浪漫地理图鉴</h1><p>从潮汐三角洲到新月沙丘，从蓝冰冰川到星夜丝路。每一种人格都不是被硬贴上的地名，而是一套与地理形成机制相呼应的生命方式。</p><button className="primary" onClick={startQuiz}>找到我的坐标 <ArrowRight/></button></div><div className="type-grid">{Object.entries(types).map(([key,t]) => <article key={key}><MiniAvatar code={key}/><div><span>{t.element}</span><h3>{t.title}</h3><b>{key} · {t.role}</b><p>{t.blurb}</p></div></article>)}</div></section>}
    <footer><div className="brand"><span>GEO</span><b>/TYPE</b><small>地格志</small></div><p>人格是地图，不是边界。© 2026 GEO/TYPE</p></footer>
  </main>;
}
