# 初步尝试 Python 大作业

## 一、项目主题

本次 Python 大作业初步尝试开发一个名为“吃什么”的轻量网页项目。项目面向校园生活场景，帮助用户在“不知道吃什么”的时候，根据饭堂、外卖、菜系、价格等条件进行筛选，并随机推荐餐馆。

项目采用的技术栈：

- 后端：Python Flask
- 数据库：SQLite
- 前端：HTML、Tailwind CSS、原生 JavaScript
- 接口测试：Python unittest、Postman

## 二、初始项目搭建

一开始先创建了基础项目目录，所有文件都放在：

```text
D:\PYTHON大作业
```

初始目录包括：

```text
app.py
requirements.txt
README.md
database/init_db.py
data/what_to_eat.db
templates/index.html
static/css/style.css
static/js/app.js
static/assets/restaurant-marker.svg
```

最早的版本实现了：

- Flask 启动首页
- SQLite 存储餐馆数据
- 随机推荐餐馆接口
- 前端页面展示餐馆列表
- 简单的筛选功能

## 三、依赖安装问题处理

在安装 Flask 依赖时，最开始使用：

```bat
python -m pip install -r requirements.txt
```

一开始出现了找不到 `requirements.txt` 的问题，原因是命令行当前目录在：

```text
C:\Users\ljr
```

而项目实际在：

```text
D:\PYTHON大作业
```

后来使用下面命令切换到了正确目录：

```bat
cd /d "D:\PYTHON大作业"
```

之后又遇到了校园网或 HTTPS 镜像源导致的 pip 报错：

```text
check_hostname requires server_hostname
```

尝试排查了环境变量代理、pip 配置和 WinHTTP 代理，最后发现使用阿里云 HTTP 镜像可以成功安装依赖：

```bat
python -m pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
```

因此后续 README 中也补充了这个安装方式。

## 四、后端功能升级

后续根据新的需求，对后端进行了升级。

### 1. 数据库表设计

将餐馆表升级为：

```text
restaurants
```

主要字段包括：

- `id`：餐馆编号
- `name`：餐馆名称
- `source_type`：来源类型，区分饭堂和外卖
- `cuisine`：菜系
- `price_range`：价格区间
- `rating`：评分
- `address`：地址
- `image_url`：图片地址
- `canteen_name`：饭堂名称
- `window_name`：饭堂窗口名称
- `delivery_time_min`：外卖预计送达时间

同时新增收藏表：

```text
favorites
```

主要字段包括：

- `user_id`：用户标识
- `restaurant_id`：餐馆 id
- `created_at`：收藏时间

由于课程项目暂时没有登录系统，所以使用 `demo_user` 模拟当前用户。

### 2. 核心 API

实现和完善了以下接口：

```http
GET /api/meta
```

获取筛选元数据，如菜系、价格区间、饭堂/外卖类型。

```http
GET /api/restaurants
```

获取餐馆列表，支持筛选：

```text
source_type=canteen
source_type=takeout
cuisine=面食
price=0-20
```

```http
GET /api/restaurants/random
```

随机返回 1-3 家符合条件的餐馆。

```http
GET /api/restaurants/<id>
```

获取餐馆详情。

```http
POST /api/favorite
```

添加或取消收藏。

```http
GET /api/favorites
```

获取用户收藏列表。

同时也保留了旧版本兼容接口：

```http
GET /api/recommend
GET /api/categories
```

## 五、前端页面开发

前端页面从单一首页升级为三个页面：

```text
templates/index.html
templates/detail.html
templates/favorites.html
```

对应功能如下：

### 1. 首页

首页实现：

- 饭堂 / 外卖 / 全部 切换
- 菜系筛选
- 价格筛选
- 随机推荐按钮
- 餐馆卡片列表
- 加载提示和错误提示

首页的 JavaScript 文件：

```text
static/js/pages/home.js
```

### 2. 餐馆详情页

详情页实现：

- 展示餐馆图片
- 展示名称、地址、评分、菜系、价格
- 饭堂显示食堂名和窗口名
- 外卖显示预计送达时间
- 收藏 / 取消收藏按钮

详情页的 JavaScript 文件：

```text
static/js/pages/detail.js
```

### 3. 收藏页

收藏页实现：

- 展示当前用户收藏的餐馆
- 支持取消收藏
- 收藏为空时显示提示

收藏页的 JavaScript 文件：

```text
static/js/pages/favorites.js
```

### 4. 公共请求封装

前端统一使用 `fetch` 调用后端接口，公共请求函数放在：

```text
static/js/modules/api.js
```

这里封装了：

- API 请求
- 用户 id
- 统一错误处理
- 收藏、详情、列表、随机推荐等接口调用

## 六、饭堂和外卖分区设计

后来又加入了一个更贴近校园生活的想法：将饭堂和外卖分开展示。

这个功能通过 `source_type` 字段实现：

```text
canteen 表示饭堂
takeout 表示外卖
```

首页增加三个切换按钮：

```text
全部
饭堂
外卖
```

对应接口示例：

```http
GET /api/restaurants?source_type=canteen
GET /api/restaurants?source_type=takeout
GET /api/restaurants/random?source_type=canteen
GET /api/restaurants/random?source_type=takeout
```

数据库示例数据中，现在包含：

```text
5 条饭堂数据
5 条外卖数据
```

饭堂数据会包含食堂名和窗口名，外卖数据会包含预计送达时间。

## 七、示例数据和测试

数据库初始化脚本：

```text
database/init_db.py
```

运行：

```bat
python database\init_db.py
```

会自动创建数据库并写入 10 条示例餐馆数据。

同时补充了可手动导入的 SQL 文件：

```text
data/sample_restaurants.sql
```

接口测试文件：

```text
tests/test_api.py
```

测试覆盖内容：

- 按菜系和价格筛选餐馆
- 按饭堂/外卖筛选餐馆
- 随机推荐 1-3 家餐馆
- 添加收藏、查询收藏、取消收藏
- 查询不存在餐馆时返回错误

运行测试：

```bat
python -m unittest discover -s tests
```

测试结果：

```text
Ran 5 tests
OK
```

## 八、运行和展示方式

项目运行方式：

```bat
cd /d "D:\PYTHON大作业"
python app.py
```

然后浏览器打开：

```text
http://127.0.0.1:5000
```

为了方便课堂展示，后来新增了一个启动脚本：

```text
start.bat
```

双击 `start.bat` 后会自动：

1. 进入项目目录
2. 检查数据库是否存在
3. 启动 Flask 项目
4. 打开浏览器访问首页

所以课程展示时不一定要手动输入命令，也不需要购买域名。本地展示使用：

```text
http://127.0.0.1:5000
```

即可。

## 九、后续可扩展方向

在讨论过程中，还提出了一些后续可以继续升级的方向：

### 1. 饮食多样性提醒

如果用户长期吃炸鸡、烧烤、奶茶等高油高热量食物，可以给出提醒：

```text
你最近油炸类食物偏多，今天可以试试轻食、粥粉面或家常菜。
```

### 2. 结合时间推荐

根据时间段推荐更合适的食物：

- 早餐：粥、面、馄饨、包子
- 午餐：盖饭、家常菜、快餐
- 晚餐：火锅、烤肉、轻食
- 赶时间：饭堂、出餐快、价格低
- 不想出门：外卖

### 3. 用户喜好记录

后续可以记录：

- 用户收藏了哪些餐馆
- 用户多次点击了哪些店
- 用户经常吃哪类菜系
- 用户是否接受随机推荐

然后在推荐时加入偏好权重，同时避免推荐过于单一。

### 4. 外部平台数据

也讨论过是否可以爬取美团、淘宝、京东等平台数据。这个方向技术上有吸引力，但涉及平台规则、反爬、数据授权和个人信息保护等问题，不建议作为当前课程项目的主要实现。

更稳妥的方式是：

- 使用自己维护的 SQLite 数据
- 使用 CSV 导入
- 使用官方开放平台 API
- 或先用模拟数据表示预计送达时间

## 十、当前项目状态

当前项目已经具备：

- Flask 后端
- SQLite 数据库
- 饭堂/外卖分区
- 餐馆筛选
- 随机推荐
- 餐馆详情
- 收藏功能
- 示例数据
- 接口测试
- README 文档
- 一键启动脚本

目前适合作为课程大作业的初步版本，也可以继续扩展为更完整的校园饮食推荐系统。

## 十一、界面优化记录

后续又对网站 UI 做了进一步美化，重点是让页面看起来更温馨、更像一个完整的小产品，而不只是课程原型。

优化方向包括：

- 整体改为暖色调美食风格
- 使用统一的卡片布局展示餐厅信息
- 统一圆角、阴影和间距
- 优化筛选栏和按钮样式
- 给餐厅卡片增加 hover 悬浮动效
- 强化标题、正文、辅助信息的字体层级
- 适配手机端和电脑端的响应式布局

页面层面也做了统一：

- 首页更像一个实际使用的推荐控制台
- 饭堂 / 外卖切换更直观
- 餐厅卡片信息排版更清晰
- 详情页和收藏页保持统一风格

这样展示时，页面会更柔和、更耐看，也更适合作业答辩场景。

## 十二、用户偏好记忆功能

后续又新增了用户偏好记忆功能，让推荐结果更像“记得用户习惯”的系统。

主要实现方式：

- 使用浏览器 `localStorage` 保存用户常用的菜系和价格筛选条件
- 下次打开首页时自动回填菜系、价格筛选项
- 用户点击餐馆详情时，会记录该餐馆为偏好店铺
- 用户收藏餐馆时，也会记录该餐馆为偏好店铺
- 随机推荐和首页列表会优先展示偏好店铺
- 餐馆卡片增加“不感兴趣”按钮
- 用户点击“不感兴趣”后，该餐馆 id 会保存到本地屏蔽列表中
- 后续列表和随机推荐都会避开被屏蔽的餐馆
- 首页增加“已屏蔽”管理入口，可以查看不感兴趣的店铺并取消屏蔽

涉及的主要文件：

```text
static/js/modules/preferences.js
static/js/modules/restaurants.js
static/js/pages/home.js
static/js/pages/detail.js
static/js/pages/favorites.js
app.py
```

这个功能没有引入登录系统，适合课程项目演示，也为后续做真正的用户画像和个性化推荐留下了扩展空间。

## 十三、饮食忌口筛选功能

后续又扩展了筛选模块，新增了「饮食忌口」选项：

- 不吃辣
- 不吃香菜
- 素食
- 海鲜过敏

数据库中给餐馆增加了 `diet_tags` 字段，用来记录店铺标签：

```text
spicy       含辣
cilantro    含香菜
vegetarian  素食友好
seafood     含海鲜
```

前端首页筛选栏增加了复选框，用户勾选后会自动刷新列表和随机推荐。后端接口通过 `diet` 参数进行过滤，例如：

```http
GET /api/restaurants?diet=not_spicy,no_cilantro
GET /api/restaurants/random?diet=no_seafood
```

其中：

- `not_spicy` 会排除含辣店铺
- `no_cilantro` 会排除含香菜店铺
- `vegetarian` 只保留素食友好店铺
- `no_seafood` 会排除含海鲜店铺

这个功能让项目从“按口味推荐”进一步扩展到“照顾个人饮食限制”的推荐，更贴近真实使用场景。

## 十四、店铺详情页优化

详情页后来进一步完善为更完整的店铺信息页。

新增字段包括：

- 招牌菜品
- 营业时间
- 人均消费
- 用户简短评价

数据库中对应增加了：

```text
signature_dishes
opening_hours
avg_spend
review_summary
```

前端详情页也从简单信息块改成了图文布局：

- 顶部返回按钮支持返回上一页
- 左侧或顶部展示店铺图片
- 右侧展示基础信息和收藏按钮
- 信息卡展示类型、菜系、价格、人均、营业时间、评分
- 招牌菜品使用标签样式展示
- 用户简评使用独立模块展示
- 加载时显示骨架屏和加载提示

这样列表页进入详情页、详情页返回列表页的流程更完整，页面视觉也更接近真实应用。

## 十五、前端工程化拆分

后来又对前端代码做了一次工程化整理。HTML、CSS 和 JavaScript 已经分别放在：

```text
templates/
static/css/style.css
static/js/
```

JavaScript 不再通过多个全局脚本互相依赖，而是改成浏览器原生 ES Module。模板页面只加载自己的页面入口：

```text
templates/index.html      -> static/js/pages/home.js
templates/detail.html     -> static/js/pages/detail.js
templates/favorites.html  -> static/js/pages/favorites.js
```

公共逻辑拆分到 `static/js/modules`：

```text
static/js/modules/api.js          接口请求模块
static/js/modules/preferences.js  本地偏好数据模块
static/js/modules/restaurants.js  餐馆数据处理模块
static/js/modules/ui.js           页面渲染和交互 UI 模块
static/js/modules/utils.js        通用工具函数模块
```

这样首页、详情页、收藏页各自只负责本页面交互，接口请求、数据处理、卡片渲染、错误提示等逻辑可以复用，后续继续加功能时更容易维护。

## 十六、后端分层重构

后续又对 Flask 后端做了一次结构重构，把原来集中在 `app.py` 里的路由、数据库查询、业务逻辑和配置拆开。

新的后端结构如下：

```text
app.py                         项目启动入口
config.py                      项目配置
what_to_eat/__init__.py         Flask 应用工厂
what_to_eat/routes/api.py       API 路由
what_to_eat/routes/pages.py     页面路由
what_to_eat/services.py         业务逻辑
what_to_eat/repositories.py     SQLite 查询与写入
what_to_eat/database.py         数据库连接工具
what_to_eat/responses.py        统一接口返回格式
what_to_eat/errors.py           全局异常处理
```

重构后的 API 统一返回：

```json
{
  "success": true,
  "message": "请求成功",
  "data": {}
}
```

出错时统一返回：

```json
{
  "success": false,
  "message": "错误提示",
  "error": "错误提示",
  "data": null
}
```

同时保留了原有接口地址和功能，例如：

```text
GET /api/meta
GET /api/restaurants
GET /api/restaurants/random
GET /api/restaurants/<id>
POST /api/favorite
GET /api/favorites
```

前端请求模块 `static/js/modules/api.js` 已经自动解包 `data` 字段，所以页面代码仍然可以像之前一样使用餐馆列表、分页对象和详情对象。

SQLite 查询也做了整理：

- 餐馆字段改为显式查询，避免到处使用 `SELECT *`
- 饮食忌口过滤从 Python 循环改到 SQL 条件中处理
- 屏蔽店铺 id 直接在 SQL 中排除
- 偏好店铺优先展示通过 SQL 的 `CASE WHEN` 排序实现
- 收藏切换在同一个数据库连接里完成，减少重复连接

重构后运行测试：

```bat
python -m unittest discover -s tests
```

结果为：

```text
Ran 14 tests
OK
```
