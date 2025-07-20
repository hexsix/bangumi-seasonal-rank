#!/usr/bin/env node

import https from 'https';
import http from 'http';
import { URL } from 'url';

// 配置
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.rinshankaiho.fun';
const TIMEOUT = 10000; // 10秒超时
const CHECK_ENDPOINT = '/api/v0/season/available';

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

// 格式化错误信息
function formatError(error, url) {
  const timestamp = new Date().toISOString();
  return `
${colors.red('构建失败：API服务不可用')}
- API地址: ${colors.blue(url)}
- 检查时间: ${colors.blue(timestamp)}
- 错误详情: ${colors.red(error.message)}
请确保API服务正常运行后重试构建。
`;
}

// 检查API健康状态
function checkApiHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(CHECK_ENDPOINT, API_BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    console.log(`${colors.blue('检查API服务状态...')}`);
    console.log(`${colors.blue('API地址:')} ${url.href}`);
    
    const req = client.request(url, {
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Bangumi-Seasonal-Rank-Build-Check/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(data);
            
            // 检查响应数据结构
            if (response && typeof response === 'object') {
              console.log(`${colors.green('✓ API服务正常')}`);
              console.log(`${colors.blue('响应状态码:')} ${res.statusCode}`);
              resolve();
            } else {
              reject(new Error('API返回无效的JSON数据'));
            }
          } catch (parseError) {
            reject(new Error(`API返回非JSON数据: ${parseError.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('无法连接到API服务器，请检查服务是否启动'));
      } else if (error.code === 'ENOTFOUND') {
        reject(new Error('无法解析API服务器地址，请检查网络连接'));
      } else if (error.code === 'ETIMEDOUT') {
        reject(new Error(`请求超时 (${TIMEOUT}ms)，API服务器响应过慢`));
      } else {
        reject(new Error(`网络错误: ${error.message}`));
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`请求超时 (${TIMEOUT}ms)`));
    });
    
    req.end();
  });
}

// 主函数
async function main() {
  try {
    await checkApiHealth();
    process.exit(0);
  } catch (error) {
    console.error(formatError(error, API_BASE_URL));
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkApiHealth };
