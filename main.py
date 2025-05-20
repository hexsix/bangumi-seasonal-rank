import requests
import json
import os
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Tuple
import re
from datetime import datetime, timedelta
from loguru import logger
from dotenv import load_dotenv
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import uvicorn
import pathlib
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone
import pytz

# 加载环境变量
load_dotenv()
TOKEN = os.getenv("TOKEN")

# 配置loguru
logger.add("logs/rank.log", rotation="1 day", retention="7 days", level="INFO")

# 基础URL
BASE_URL = "https://api.bgm.tv"
USER_AGENT = "rank.rinshankaiho.fun (https://github.com/rinshankaiho/rank.rinshankaiho.fun)"

# 创建FastAPI应用
app = FastAPI(title="番剧排行API", description="用于更新番剧季度排行数据")

# 创建调度器
scheduler = BackgroundScheduler()

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
                wait_time = 2 ** retry_count
                logger.info(f"等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
            else:
                logger.error(f"获取条目 {subject_id} 详情失败，已达最大重试次数: {str(e)}")
    
    return {}

def get_json_path(year: str, month: str) -> str:
    """获取JSON文件路径"""
    # 确保static目录存在
    os.makedirs('static', exist_ok=True)
    # 格式化文件名
    return f"static/{year}{month.zfill(2)}.json"

def get_last_update_time(year: str, month: str) -> Optional[datetime]:
    """获取上次更新时间"""
    file_path = get_json_path(year, month)
    
    if not os.path.exists(file_path):
        return None
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # 检查是否有last_update_time字段
            if 'last_update_time' in data:
                # 将时间字符串转换为datetime对象
                return datetime.fromisoformat(data['last_update_time'])
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error(f"读取上次更新时间失败: {str(e)}")
    
    return None

def should_update_season(year: str, month: str, force: bool = False) -> Tuple[bool, str]:
    """判断是否应该更新季度数据
    
    返回值：(是否应该更新, 原因)
    """
    if force:
        return True, "强制更新"
        
    # 获取当前年份
    current_year = datetime.now().year
    season_year = int(year)
    
    # 检查文件是否存在
    file_path = get_json_path(year, month)
    if not os.path.exists(file_path):
        return True, "文件不存在"
    
    # 获取上次更新时间
    last_update = get_last_update_time(year, month)
    if last_update is None:
        return True, "无法获取上次更新时间"
    
    # 判断是否需要更新
    # 1. 一年内的季度默认更新
    if season_year >= current_year - 1:
        return True, "一年内的季度自动更新"
    
    # 2. 超过一年的季度，上次更新超过1个月才更新
    now = datetime.now()
    if (now - last_update) > timedelta(days=30):
        return True, f"上次更新时间 {last_update.strftime('%Y-%m-%d %H:%M:%S')}，已超过1个月"
    
    return False, f"上次更新时间 {last_update.strftime('%Y-%m-%d %H:%M:%S')}，不需要更新"

def save_to_json(data: Dict, year: str, month: str) -> bool:
    """保存数据到JSON文件，包含更新时间"""
    file_path = get_json_path(year, month)
    
    # 添加更新时间
    data['last_update_time'] = datetime.now().isoformat()
    
    logger.info(f"正在保存数据到文件: {file_path}")
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"数据已成功保存到 {file_path}")
        
        # 保存成功后更新前端文件中的季度列表
        update_frontend_seasons_list()
        
        return True
    except Exception as e:
        logger.error(f"保存数据到 {file_path} 失败: {str(e)}")
        return False

def update_frontend_seasons_list():
    """更新前端文件中的季度列表
    通过扫描static目录中的JSON文件，生成最新的季度列表，并更新到前端文件中"""
    logger.info("跳过更新前端文件中的季度列表")
    pass

def process_season(index: Dict, force: bool = False) -> Dict:
    """处理单个季度数据并返回结果"""
    result = {
        "success": False,
        "message": "",
        "data": {}
    }
    
    logger.info(f"正在处理 {index['title']}...")
    
    # 检查是否需要更新
    should_update, reason = should_update_season(index['year'], index['month'], force)
    if not should_update:
        message = f"跳过 {index['title']} 的更新：{reason}"
        logger.info(message)
        result["message"] = message
        result["data"] = {
            "year": index['year'],
            "month": index['month'],
            "title": index['title'],
            "last_update": get_last_update_time(index['year'], index['month']).isoformat() if get_last_update_time(index['year'], index['month']) else None
        }
        return result
    
    logger.info(f"将更新 {index['title']}：{reason}")
    
    # 获取目录详情
    index_detail = get_index_detail(index['id'])
    if not index_detail:
        message = f"无法获取目录 {index['id']} 的详情，处理失败"
        logger.warning(message)
        result["message"] = message
        return result
    
    # 获取目录中的条目列表
    index_subjects = get_index_subjects(index['id'])
    if not index_subjects:
        message = f"无法获取目录 {index['id']} 的条目列表，处理失败"
        logger.warning(message)
        result["message"] = message
        return result
    
    # 获取所有条目的详细信息
    subjects = []
    for subject in index_subjects:
        subject_id = subject['id']
        subject_detail = get_subject_detail(str(subject_id))
        if subject_detail:
            subjects.append(subject_detail)
        # 添加短暂延迟，避免请求过于频繁
        time.sleep(0.5)
    
    # 准备数据
    data = {
        'title': index['title'],
        'subjects': subjects
    }
    
    # 保存数据
    if save_to_json(data, index['year'], index['month']):
        result["success"] = True
        result["message"] = f"成功更新 {index['title']} 的数据"
        result["data"] = {
            "year": index['year'],
            "month": index['month'],
            "title": index['title'],
            "subject_count": len(subjects),
            "update_time": datetime.now().isoformat()
        }
    else:
        result["message"] = f"保存 {index['title']} 的数据失败"
    
    return result

def update_all_seasons(force: bool = False) -> List[Dict]:
    """更新所有季度数据并返回结果"""
    results = []
    # 获取所有季度索引
    indexes = get_seasonal_indexes()
    
    for index in indexes:
        result = process_season(index, force)
        results.append(result)
        # 在处理不同季度间添加延迟
        time.sleep(2)
    
    return results

def scheduled_update():
    """定时任务：更新所有季度数据"""
    logger.info("开始执行定时更新任务")
    try:
        results = update_all_seasons()
        success_count = sum(1 for r in results if r.get("success", False))
        logger.info(f"定时更新完成，成功更新 {success_count}/{len(results)} 个季度数据")
    except Exception as e:
        logger.error(f"定时更新任务出错: {str(e)}")
    logger.info("定时更新任务执行完毕")

async def update_all_seasons_background(background_tasks: BackgroundTasks, force: bool = False):
    """后台任务：更新所有季度数据"""
    def task():
        logger.info("开始后台更新所有季度数据")
        update_all_seasons(force)
        logger.info("后台更新所有季度数据完成")
    
    background_tasks.add_task(task)
    return {"message": "已开始后台更新所有季度数据", "force": force}

async def update_specific_season_background(background_tasks: BackgroundTasks, year: str, month: str, force: bool = False):
    """后台任务：更新特定季度数据"""
    def task():
        logger.info(f"开始后台更新 {year}年{month}月 季度数据")
        # 获取所有季度索引
        indexes = get_seasonal_indexes()
        # 查找匹配的季度
        for index in indexes:
            if index['year'] == year and index['month'] == month:
                process_season(index, force)
                logger.info(f"完成 {year}年{month}月 季度数据更新")
                return
        logger.warning(f"未找到 {year}年{month}月 的季度数据")
    
    background_tasks.add_task(task)
    return {"message": f"已开始后台更新 {year}年{month}月 季度数据", "force": force}

class Season(BaseModel):
    year: str
    month: str
    force: bool = False

@app.get("/")
async def root():
    return {"message": "番剧排行API服务正在运行"}

@app.post("/update/all")
async def update_all(background_tasks: BackgroundTasks, force: bool = False):
    """更新所有季度的数据
    
    参数:
    - force: 是否强制更新，默认为False
    """
    return await update_all_seasons_background(background_tasks, force)

@app.post("/update/season")
async def update_season(season: Season, background_tasks: BackgroundTasks):
    """更新特定季度的数据
    
    参数:
    - season.year: 年份
    - season.month: 月份
    - season.force: 是否强制更新，默认为False
    """
    return await update_specific_season_background(
        background_tasks, 
        season.year, 
        season.month,
        season.force
    )

@app.get("/seasons")
async def get_seasons():
    """获取所有可用的季度列表"""
    try:
        indexes = get_seasonal_indexes()
        seasons = []
        
        for idx in indexes:
            year = idx["year"]
            month = idx["month"]
            
            # 获取上次更新时间和文件状态
            last_update = get_last_update_time(year, month)
            file_path = get_json_path(year, month)
            file_exists = os.path.exists(file_path)
            file_size = os.path.getsize(file_path) if file_exists else 0
            
            seasons.append({
                "year": year,
                "month": month, 
                "title": idx["title"],
                "last_update": last_update.isoformat() if last_update else None,
                "file_exists": file_exists,
                "file_size": file_size
            })
            
        return {"seasons": seasons}
    except Exception as e:
        logger.error(f"获取季度列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取季度列表失败: {str(e)}")

@app.get("/seasons/list")
async def get_seasons_list():
    """获取简化的季度列表，按照YYYYMM格式排序"""
    try:
        # 获取static目录下的所有.json文件
        static_dir = "static"
        json_files = []
        
        if os.path.exists(static_dir):
            for file in os.listdir(static_dir):
                if file.endswith(".json") and len(file) == 11:  # 形如YYYYMM.json的文件长度为11
                    try:
                        season_code = file[:-5]  # 移除.json后缀
                        if len(season_code) == 6 and season_code.isdigit():
                            json_files.append(season_code)
                    except:
                        pass
        
        # 按降序排序（最新的季度在前）
        json_files.sort(reverse=True)
        
        return {"seasons": json_files}
    except Exception as e:
        logger.error(f"获取季度列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取季度列表失败: {str(e)}")

@app.get("/scheduler/status")
async def get_scheduler_status():
    """获取调度器状态"""
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.astimezone(timezone('Asia/Shanghai')).isoformat() if job.next_run_time else None
        })
    
    return {
        "running": scheduler.running,
        "jobs": jobs
    }

# 启动时设置定时任务
@app.on_event("startup")
def setup_scheduler():
    """在应用启动时设置调度器"""
    # 添加定时任务，北京时间凌晨3点33分执行
    scheduler.add_job(
        scheduled_update,
        trigger=CronTrigger(hour=3, minute=33, timezone=timezone('Asia/Shanghai')),
        id="daily_update",
        name="每日更新任务",
        replace_existing=True
    )
    
    # 启动调度器
    scheduler.start()
    logger.info("调度器已启动，设置了每日更新任务（北京时间凌晨3点33分）")

# 关闭时停止调度器
@app.on_event("shutdown")
def shutdown_scheduler():
    """在应用关闭时停止调度器"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("调度器已关闭")

if __name__ == "__main__":
    # 检查是否有命令行参数
    import sys
    if len(sys.argv) > 1:
        # 处理命令行参数
        if sys.argv[1] == "--update-seasons":
            # 仅更新季度列表
            logger.info("执行季度列表更新操作")
            update_frontend_seasons_list()
            sys.exit(0)
            
    # 默认运行FastAPI应用
    uvicorn.run(app, host="0.0.0.0", port=8000)
