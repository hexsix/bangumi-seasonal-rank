import requests
import json
import os
from bs4 import BeautifulSoup
from typing import List, Dict
import re
from datetime import datetime
from loguru import logger
from dotenv import load_dotenv
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 加载环境变量
load_dotenv()
TOKEN = os.getenv("TOKEN")

# 配置loguru
logger.add("logs/rank.log", rotation="1 day", retention="7 days", level="INFO")

# 基础URL
BASE_URL = "https://api.bgm.tv"
USER_AGENT = "rank.rinshankaiho.fun (https://github.com/rinshankaiho/rank.rinshankaiho.fun)"

# 创建一个会话并配置重试机制
def create_session():
    session = requests.Session()
    retry_strategy = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def has_next_page(soup: BeautifulSoup) -> bool:
    """检查是否存在下一页"""
    # 查找分页元素
    pagination = soup.find('div', class_='page_inner')
    if not pagination:
        return False
        
    # 检查当前页码
    current_page = pagination.find('strong', class_='p_cur')
    if not current_page:
        return False
        
    # 查找是否有链接到下一页的元素
    next_page_links = pagination.find_all('a', class_='p')
    if not next_page_links:
        return False
        
    # 如果找到链接，并且有链接的页码大于当前页码，则有下一页
    current_page_num = int(current_page.text.strip())
    for link in next_page_links:
        if link.text.strip().isdigit() and int(link.text.strip()) > current_page_num:
            return True
    
    return False

def get_seasonal_indexes() -> List[Dict]:
    """获取季度番剧列表"""
    base_url = "https://bgm.tv/user/lilyurey/index"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    }
    indexes = []
    page = 1
    
    logger.info("开始获取季度番剧列表")
    session = create_session()
    
    while True:
        url = f"{base_url}?page={page}"
        logger.debug(f"正在获取第 {page} 页: {url}")
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                response = session.get(url, headers=headers, timeout=(10, 30))
                response.raise_for_status()
                # 确保使用正确的编码
                response.encoding = 'utf-8'
                break  # 成功获取数据，跳出重试循环
            except requests.RequestException as e:
                retry_count += 1
                logger.warning(f"获取第 {page} 页失败(第{retry_count}次): {str(e)}")
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"获取第 {page} 页失败，已达最大重试次数: {str(e)}")
                    return indexes  # 返回已获取的索引
        
        if retry_count >= max_retries:
            break  # 重试失败，退出主循环
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        page_indexes = []
        # 查找所有目录项
        for item in soup.select('.line_list li'):
            link = item.find('a')
            if not link:
                continue
                
            href = link.get('href')
            if not href or '/index/' not in href:
                continue
                
            title = link.get_text(strip=True)
            if not title:
                continue
                
            logger.debug(f"原始标题: {title}")
            # 匹配多种可能的标题格式
            match = re.search(r'(\d{4})年(\d{1,2})月(?:番)?(?:（共\d+部）)?', title)
            if match:
                year = match.group(1)
                month = match.group(2)
                page_indexes.append({
                    'id': href.split('/')[-1],
                    'year': year,
                    'month': month,
                    'title': title
                })
                logger.debug(f"匹配成功: {title} -> {year}年{month}月")
        
        logger.info(f"第 {page} 页找到 {len(page_indexes)} 个季度番剧")
        indexes.extend(page_indexes)
        
        if not has_next_page(soup):
            logger.info("已到达最后一页")
            break
            
        page += 1
    
    logger.info(f"总共找到 {len(indexes)} 个季度番剧")
    return indexes

def get_index_detail(index_id: str) -> Dict:
    """获取目录详情"""
    url = f"{BASE_URL}/v0/indices/{index_id}"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    logger.debug(f"正在获取目录详情: {index_id}")
    session = create_session()
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            response = session.get(url, headers=headers, timeout=(10, 30))
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, json.JSONDecodeError) as e:
            retry_count += 1
            logger.warning(f"获取目录 {index_id} 详情失败(第{retry_count}次): {str(e)}")
            if retry_count < max_retries:
                wait_time = 2 ** retry_count
                logger.info(f"等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
            else:
                logger.error(f"获取目录 {index_id} 详情失败，已达最大重试次数: {str(e)}")
    
    return {}

def get_index_subjects(index_id: str) -> List[Dict]:
    """获取目录中的条目列表"""
    url = f"{BASE_URL}/v0/indices/{index_id}/subjects"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    logger.debug(f"正在获取目录条目列表: {index_id}")
    session = create_session()
    subjects = []
    offset = 0
    limit = 50  # API最大限制
    
    while True:
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                response = session.get(
                    url, 
                    headers=headers, 
                    params={"offset": offset, "limit": limit},
                    timeout=(10, 30)
                )
                response.raise_for_status()
                data = response.json()
                
                # 假设响应格式包含data字段，里面是条目列表
                current_subjects = data.get("data", [])
                subjects.extend(current_subjects)
                
                # 判断是否还有更多条目
                if len(current_subjects) < limit:
                    return subjects
                    
                # 更新偏移量获取下一页
                offset += limit
                break  # 成功获取数据，跳出重试循环
                
            except (requests.RequestException, json.JSONDecodeError) as e:
                retry_count += 1
                logger.warning(f"获取目录 {index_id} 条目列表失败(第{retry_count}次): {str(e)}")
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"获取目录 {index_id} 条目列表失败，已达最大重试次数: {str(e)}")
                    return subjects  # 返回已获取的条目
    
    return subjects

def get_subject_detail(subject_id: str) -> Dict:
    """获取条目详情"""
    url = f"{BASE_URL}/v0/subjects/{subject_id}"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    logger.debug(f"正在获取条目详情: {subject_id}")
    session = create_session()
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            response = session.get(url, headers=headers, timeout=(10, 30))
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, json.JSONDecodeError) as e:
            retry_count += 1
            logger.warning(f"获取条目 {subject_id} 详情失败(第{retry_count}次): {str(e)}")
            if retry_count < max_retries:
                wait_time = 2 ** retry_count  # 指数退避
                logger.info(f"等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
            else:
                logger.error(f"获取条目 {subject_id} 详情失败，已达最大重试次数: {str(e)}")
    
    return {}

def save_to_json(data: Dict, year: str, month: str):
    """保存数据到JSON文件"""
    # 确保static目录存在
    os.makedirs('static', exist_ok=True)
    
    # 格式化文件名
    filename = f"static/{year}{month.zfill(2)}.json"
    
    logger.info(f"正在保存数据到文件: {filename}")
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"数据已成功保存到 {filename}")
    except Exception as e:
        logger.error(f"保存数据到 {filename} 失败: {str(e)}")

def main():
    logger.info("程序开始运行")
    # 获取所有季度索引
    indexes = get_seasonal_indexes()
    
    for index in indexes:
        logger.info(f"正在处理 {index['title']}...")
        
        # 获取目录详情
        index_detail = get_index_detail(index['id'])
        if not index_detail:
            logger.warning(f"无法获取目录 {index['id']} 的详情，跳过此季度")
            continue
        
        # 获取目录中的条目列表
        index_subjects = get_index_subjects(index['id'])
        if not index_subjects:
            logger.warning(f"无法获取目录 {index['id']} 的条目列表，跳过此季度")
            continue
        
        # 获取所有条目的详细信息
        subjects = []
        for subject in index_subjects:
            subject_id = subject['id']
            subject_detail = get_subject_detail(str(subject_id))
            if subject_detail:
                subjects.append(subject_detail)
            # 添加短暂延迟，避免请求过于频繁
            time.sleep(0.5)
        
        # 保存数据
        save_to_json({
            'title': index['title'],
            'subjects': subjects
        }, index['year'], index['month'])
        
        logger.info(f"完成 {index['title']} 的数据保存")
        # 在处理不同季度间添加延迟
        time.sleep(2)

    logger.info("程序运行完成")

if __name__ == "__main__":
    main()
