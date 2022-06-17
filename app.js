const express = require("express");
const app = express();
const axios = require("axios");
const moment = require('moment');

// TG Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN
// TG 聊天 ID
const CHAT_ID = process.env.CHAT_ID;
// TG 消息解析模式
const PARSE_MODE = "Markdown"

app.use(express.json())

// 调用 TG API 发送消息
const callTGBot = (text) => {
  let url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
  axios
    .post(url, {
      chat_id: CHAT_ID,
      parse_mode: PARSE_MODE,
      text: text,
    })
    .then((res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
};

// 将 UptimeKuma 数据拼接成 Markdown 格式的文本
const uptimeKumaData = (data) => {
  return `
  *➖➖➖➖➖${data.monitor.name}➖➖➖➖➖*
🔹 *服务标签*: ${data.monitor.tags.map((tag) => `| 🏷️ *${tag.name}* `).join('')}
🔹 *地址*: [${data.monitor.name}](${data.monitor.url})  
🔹 *状态*: ${data.heartbeat.status ? "🟢 UP" : "🔴 DOWN"}  
🔹 *时间*: ${moment.utc(data.heartbeat.time).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}  
🔹 *信息*: ${data.heartbeat.msg}  
🔹 *心跳间隔*: ${data.monitor.interval} 秒  
🔹 *重试次数*: ${data.monitor.maxretries} 次  
🔹 *监控面板*: [UptimeKuma](https://home.evil➖scream.cn:8445/dashboard)  
  `
}

// 默认路由
app.post(`/`, (req, res) => {
  // 获取post params
  let data = req.body
  // 调用TGBot发送消息
  callTGBot(uptimeKumaData(data));
  res.send(data)
});

app.get("/404", (req, res) => {
  res.status(404).send("Not found");
});

app.get("/500", (req, res) => {
  res.status(500).send("Server Error");
});

// Error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send("Internal Serverless Error");
});



// Web 类型云函数，只能监听 9000 端口
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});
