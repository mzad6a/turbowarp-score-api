const express = require("express");
const cors = require("cors");
const { kv } = require('@vercel/kv'); // 引入 Vercel KV
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 接收并保存玩家 JSON 数据的接口
app.post("/api/save-player-data", async (req, res) => {
    const { player_id, secret_key, game_data } = req.body;

    // 1. 验证消息来源（防伪造）
    if (secret_key !== process.env.SECRET_KEY) {
        return res.status(403).json({ error: "非法请求" });
    }

    // 2. 基础校验（防止传空数据）
    if (!player_id || !game_data) {
        return res.status(400).json({ error: "缺少必要数据" });
    }

    try {
        // 3. 将 JSON 键值对存入云端 KV 数据库
        // 键名格式: "player:玩家ID"
        // 值: 你传过来的整个 JSON 对象
        await kv.set(`player:${player_id}`, game_data);

        console.log(`成功保存玩家 ${player_id} 的数据:`, game_data);
        return res.status(200).json({ message: "数据保存成功！" });
    } catch (err) {
        console.error("保存数据失败:", err);
        return res.status(500).json({ error: "服务器内部错误" });
    }
});

module.exports = app;