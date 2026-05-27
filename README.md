# 吃什么

“吃什么”是一个适合课程作业的轻量网页项目，用来按饭堂/外卖、菜系和价格筛选餐馆，并随机推荐 1-3 家餐馆。项目使用 Flask + SQLite 提供后端 API，前端使用 HTML、Tailwind CSS CDN 和原生 JavaScript。

## 项目结构

```text
D:\PYTHON大作业
├── app.py
├── config.py
├── requirements.txt
├── README.md
├── data
│   ├── what_to_eat.db
│   └── sample_restaurants.sql
├── database
│   └── init_db.py
├── what_to_eat
│   ├── __init__.py
│   ├── database.py
│   ├── errors.py
│   ├── repositories.py
│   ├── responses.py
│   ├── services.py
│   └── routes
│       ├── __init__.py
│       ├── api.py
│       └── pages.py
├── static
│   ├── assets
│   │   └── restaurant-marker.svg
│   ├── css
│   │   └── style.css
│   └── js
│       ├── modules
│       │   ├── api.js
│       │   ├── preferences.js
│       │   ├── restaurants.js
│       │   ├── ui.js
│       │   └── utils.js
│       └── pages
│           ├── home.js
│           ├── detail.js
│           └── favorites.js
├── templates
│   ├── index.html
│   ├── detail.html
│   └── favorites.html
└── tests
    └── test_api.py
```

## 环境搭建

如果已经安装好依赖，可以直接双击 `start.bat` 启动项目。脚本会自动打开浏览器访问 `http://127.0.0.1:5000`。

CMD 推荐命令：

```bat
cd /d "D:\PYTHON大作业"
python -m pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
python database\init_db.py
python app.py
```

启动后打开：

```text
http://127.0.0.1:5000
```

如果你使用 PowerShell：

```powershell
cd "D:\PYTHON大作业"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
python database\init_db.py
python app.py
```

## 数据库设计

`restaurants` 餐馆表：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER | 主键 |
| name | TEXT | 餐馆名称 |
| source_type | TEXT | 来源类型，`canteen` 表示饭堂，`takeout` 表示外卖 |
| cuisine | TEXT | 菜系 |
| price_range | TEXT | 价格区间，如 `0-20` |
| rating | REAL | 评分，0-5 |
| address | TEXT | 地址 |
| image_url | TEXT | 图片地址 |
| canteen_name | TEXT | 饭堂名称，外卖可为空 |
| window_name | TEXT | 饭堂窗口名，外卖可为空 |
| delivery_time_min | INTEGER | 外卖预计送达分钟数，饭堂可为空 |
| diet_tags | TEXT | 饮食标签，如 `spicy,cilantro,vegetarian,seafood` |
| signature_dishes | TEXT | 招牌菜品，多个菜品用逗号分隔 |
| opening_hours | TEXT | 营业时间 |
| avg_spend | INTEGER | 人均消费 |
| review_summary | TEXT | 用户简短评价 |

`favorites` 用户收藏表：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| user_id | TEXT | 用户标识 |
| restaurant_id | INTEGER | 餐馆 id |
| created_at | TEXT | 收藏时间 |

项目没有登录系统，前端默认使用 `demo_user` 模拟当前用户。

## 页面功能

- 首页 `/`：饭堂/外卖切换、关键词搜索、菜系筛选、价格筛选、饮食忌口筛选、随机推荐按钮、分页餐馆卡片列表、偏好记忆、不感兴趣屏蔽和取消屏蔽
- 详情页 `/restaurant/<id>`：餐馆图片、名称、评分、地址、来源信息、招牌菜品、营业时间、人均消费、用户简评、收藏按钮
- 收藏页 `/favorites`：展示当前用户收藏的餐馆，可取消收藏

## 后端代码结构

后端已按 Flask 项目常见分层拆分：

- `app.py`：项目启动入口，创建 `app`
- `config.py`：数据库路径、分页数量、来源类型、饮食忌口等配置
- `what_to_eat/__init__.py`：应用工厂，注册路由、异常处理和 CORS
- `what_to_eat/routes/api.py`：API 路由和请求参数解析
- `what_to_eat/routes/pages.py`：页面路由
- `what_to_eat/services.py`：餐馆筛选、分页、随机推荐、收藏等业务逻辑
- `what_to_eat/repositories.py`：SQLite 查询和写入操作
- `what_to_eat/database.py`：数据库连接和基础查询工具
- `what_to_eat/responses.py`：统一接口返回格式
- `what_to_eat/errors.py`：全局异常捕获和错误提示

## 前端代码结构

前端使用浏览器原生 ES Module 拆分代码：

- `static/js/pages/home.js`：首页交互入口，负责筛选、搜索、分页、随机推荐和屏蔽管理
- `static/js/pages/detail.js`：详情页交互入口，负责加载详情、返回按钮和收藏按钮
- `static/js/pages/favorites.js`：收藏页交互入口，负责收藏列表和取消收藏
- `static/js/modules/api.js`：统一封装后端接口请求
- `static/js/modules/preferences.js`：统一管理 `localStorage` 偏好数据
- `static/js/modules/restaurants.js`：处理餐馆筛选参数、来源文本和饮食标签数据
- `static/js/modules/ui.js`：封装卡片渲染、加载状态、错误提示、分页等页面 UI
- `static/js/modules/utils.js`：放通用工具函数，如 HTML 转义、防抖和 DOM 查询

## API 说明

所有 API 现在统一返回以下格式：

```json
{
  "success": true,
  "message": "请求成功",
  "data": {}
}
```

接口出错时返回：

```json
{
  "success": false,
  "message": "错误提示",
  "error": "错误提示",
  "data": null
}
```

前端 `static/js/modules/api.js` 会自动读取 `data` 字段，所以页面功能不需要额外处理包装格式。

### 获取筛选元数据

```http
GET /api/meta
```

返回：

```json
{
  "success": true,
  "message": "请求成功",
  "data": {
    "source_types": [
      {"value": "canteen", "label": "饭堂"},
      {"value": "takeout", "label": "外卖"}
    ],
    "cuisines": ["中餐", "小吃", "川湘"],
    "prices": ["0-20", "20-40", "40-60", "60+"]
  }
}
```

### 获取餐馆列表

```http
GET /api/restaurants?source_type=canteen&cuisine=面食&price=0-20&keyword=牛肉&diet=not_spicy,no_cilantro&page=1
```

说明：

- `source_type`、`cuisine`、`price`、`keyword` 和 `page` 都是可选参数
- `source_type=canteen` 表示饭堂，`source_type=takeout` 表示外卖
- `keyword` 支持按店铺名称和菜系模糊搜索
- `diet` 支持多个饮食忌口，用逗号分隔
- 传入 `page` 时返回分页结果，每页固定 8 条
- `blocked_ids` 可传入逗号分隔的店铺 id，用来屏蔽不感兴趣店铺
- `preferred_ids` 可传入逗号分隔的店铺 id，用来让点击、收藏过的店铺优先展示

分页返回示例：

```json
{
  "success": true,
  "message": "请求成功",
  "data": {
    "items": [],
    "page": 1,
    "page_size": 8,
    "total": 10,
    "total_pages": 2
  }
}
```

饮食忌口可选值：

| 参数值 | 页面显示 | 过滤逻辑 |
| --- | --- | --- |
| not_spicy | 不吃辣 | 排除含 `spicy` 标签的店铺 |
| no_cilantro | 不吃香菜 | 排除含 `cilantro` 标签的店铺 |
| vegetarian | 素食 | 只保留含 `vegetarian` 标签的店铺 |
| no_seafood | 海鲜过敏 | 排除含 `seafood` 标签的店铺 |

### 获取餐馆详情

```http
GET /api/restaurants/1?user_id=demo_user
```

返回餐馆信息，并带 `is_favorite` 字段。

### 随机推荐餐馆

```http
GET /api/restaurants/random?source_type=takeout&cuisine=快餐&price=20-40&keyword=炸鸡&diet=not_spicy&preferred_ids=6,8&blocked_ids=7
```

返回 1-3 家符合筛选条件的餐馆。`preferred_ids` 会让用户点击、收藏过的店铺优先出现在推荐中，`blocked_ids` 会让“不感兴趣”的店铺不再出现。

### 添加或取消收藏

```http
POST /api/favorite
Content-Type: application/json

{
  "user_id": "demo_user",
  "restaurant_id": 1
}
```

同一餐馆重复请求会在“收藏”和“取消收藏”之间切换。也可以传入 `"action": "add"` 或 `"action": "remove"` 指定操作。

### 获取收藏列表

```http
GET /api/favorites?user_id=demo_user
```

## 示例数据

初始化数据库会自动写入 10 条示例餐馆数据：

```bat
python database\init_db.py
```

如果想手动导入 SQL，可先创建好表结构，再执行：

```bat
sqlite3 data\what_to_eat.db < data\sample_restaurants.sql
```

## 测试用例

测试文件在 `tests/test_api.py`，覆盖：

- 按菜系和价格筛选餐馆
- 按饭堂/外卖来源筛选餐馆
- 按店铺名称或菜系关键词搜索
- 按饮食忌口过滤店铺
- 分页返回餐馆列表，每页 8 条
- 屏蔽不感兴趣店铺
- 偏好店铺优先推荐
- 随机推荐返回 1-3 家餐馆
- 添加收藏、获取收藏、取消收藏
- 查询不存在餐馆时返回错误

运行测试：

```bat
python -m unittest discover -s tests
```

## Postman 验证

1. 启动项目：`python app.py`
2. 新建请求，基础地址使用 `http://127.0.0.1:5000`
3. 验证餐馆列表：`GET http://127.0.0.1:5000/api/restaurants`
4. 验证饭堂筛选：`GET http://127.0.0.1:5000/api/restaurants?source_type=canteen`
5. 验证外卖筛选：`GET http://127.0.0.1:5000/api/restaurants?source_type=takeout`
6. 验证组合筛选：`GET http://127.0.0.1:5000/api/restaurants?source_type=canteen&cuisine=面食&price=0-20`
7. 验证关键词搜索：`GET http://127.0.0.1:5000/api/restaurants?keyword=牛肉`
8. 验证分页：`GET http://127.0.0.1:5000/api/restaurants?page=1`
9. 验证忌口筛选：`GET http://127.0.0.1:5000/api/restaurants?diet=not_spicy,no_cilantro`
10. 验证随机推荐：`GET http://127.0.0.1:5000/api/restaurants/random?source_type=takeout&diet=no_seafood`
11. 验证收藏：选择 POST，请求地址 `http://127.0.0.1:5000/api/favorite`，Body 选择 raw JSON：

```json
{
  "user_id": "demo_user",
  "restaurant_id": 1
}
```

12. 验证收藏列表：`GET http://127.0.0.1:5000/api/favorites?user_id=demo_user`

## 部署说明

本地部署：安装依赖、初始化数据库、执行 `python app.py` 即可，适合课程展示。

学生服务器部署：

1. 将项目上传到服务器，比如 `/home/student/what-to-eat`
2. 安装 Python 3 和依赖：

```bash
cd /home/student/what-to-eat
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python database/init_db.py
```

3. 临时运行：

```bash
python app.py
```

4. 如果需要后台运行，可以使用 `nohup`：

```bash
nohup python app.py > server.log 2>&1 &
```

课程项目到这一步通常已经够用；正式上线可以再配置 Gunicorn 和 Nginx。
