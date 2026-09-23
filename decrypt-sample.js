#!/usr/bin/env node
'use strict';

const { createDecipheriv } = require('node:crypto');
const { readFileSync } = require('node:fs');

// 由前端 bundle 中四段字节经 XOR 还原；仅用于已获授权的安全审计与迁移验证。
const LEGACY_KEY = Buffer.from('KVksL2jJ6eLOP7cX', 'utf8');

/**
 * 解密该前端遗留协议的 Base64 载荷。
 *
 * 协议：AES-128-ECB + PKCS#7 填充，明文为 UTF-8 JSON。
 * @param {string} encryptedBase64 Base64 编码的密文。
 * @returns {string} UTF-8 明文。
 * @throws {TypeError|Error} 输入无效、密文格式不正确或填充校验失败时抛出。
 */
function decryptLegacyPayload(encryptedBase64) {
  if (typeof encryptedBase64 !== 'string' || encryptedBase64.trim() === '') {
    throw new TypeError('encryptedBase64 必须是非空 Base64 字符串');
  }

  const normalized = encryptedBase64.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error('密文不是规范的 Base64 数据');
  }

  const ciphertext = Buffer.from(normalized, 'base64');
  if (ciphertext.length === 0 || ciphertext.length % 16 !== 0) {
    throw new Error('AES-ECB 密文长度必须是 16 字节的整数倍');
  }

  const decipher = createDecipheriv('aes-128-ecb', LEGACY_KEY, null);
  decipher.setAutoPadding(true); // Node/OpenSSL 执行 PKCS#7 去填充与校验。
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

if (require.main === module) {
  const inputPath = process.argv[2] ?? 'en.txt';
  process.stdout.write(`${decryptLegacyPayload(readFileSync(inputPath, 'utf8'))}\n`);
}

module.exports = { decryptLegacyPayload };
