# 地格志 v2

独立的静态实现，无构建依赖。运行 `python -m http.server 4180`，打开 http://localhost:4180 。正式部署使用仓库原有GitHub Pages渠道。

模型、30题、反向计分和16个五维原型在 model.js；界面和匿名数据提交在 app.js。Supabase使用原站公开的publishable key，权限由数据库RLS控制；不含服务端密钥。五维模型无验证数据，详细说明见 DESIGN-RATIONALE.md。

人物图使用原仓库 public/geotype-portraits-v2.webp，部署时复制到站点目录。这是现有插画沿用，尚未为新构念重新绘图。

验证：`node test-model.js`。问卷停留时间累计前台停留，不参与计分。只在最终完成时提交，匿名存储可由首页取消。未完成问卷不上传。
