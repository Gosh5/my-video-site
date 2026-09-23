# Cloudflare Worker 遗留载荷解密工具

部署后访问 Worker 根路径即可打开解密页面：粘贴 Base64 密文并点击“解密”，结果会显示在页面中；如果结果是 JSON，会自动格式化。

> 仅用于已获授权的审计与迁移验证。该 Worker 为兼容仓库现有的 AES-128-ECB 遗留协议而保留固定密钥；它不是访问控制或直播源保护方案，**不要**将它部署为公开服务。

## 部署

1. 登录 Cloudflare：`npx wrangler login`
2. 部署：`npx wrangler deploy`
3. 打开命令输出中的 Worker URL。

部署前请将 Worker 路由限制在受控的内部域名，并使用 Cloudflare Access、身份认证或网络层访问控制保护它。

## API

页面使用同源 API，可供受控工具调用：

```http
POST /api/decrypt
content-type: application/json

{"ciphertext":"Base64 密文"}
```

成功时返回 `{"plaintext":"解密文本"}`；输入不合法、密文长度异常或 PKCS#7 填充校验失败时返回 `400` 和 `{"error":"..."}`。
