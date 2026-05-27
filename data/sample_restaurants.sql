DELETE FROM favorites;
DELETE FROM restaurants;

INSERT INTO restaurants (
    id, name, source_type, cuisine, price_range, rating, address,
    image_url, canteen_name, window_name, delivery_time_min, diet_tags,
    signature_dishes, opening_hours, avg_spend, review_summary
) VALUES
(1, '东门牛肉面', 'canteen', '面食', '0-20', 4.6, '一食堂一楼 A03 窗口', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', '一食堂', 'A03 牛肉面', NULL, 'spicy,cilantro', '红烧牛肉面,卤蛋,凉拌海带', '06:30-21:30', 18, '汤头浓，面条筋道，早八前来一碗很稳。'),
(2, '二食堂麻辣烫', 'canteen', '川湘', '20-40', 4.4, '二食堂二楼 B12 窗口', 'https://images.unsplash.com/photo-1607098665874-fd193397547b?auto=format&fit=crop&w=900&q=80', '二食堂', 'B12 麻辣烫', NULL, 'spicy,cilantro', '自选麻辣烫,酸辣粉,牛肉丸', '10:30-20:30', 26, '菜品选择多，微辣也很有存在感。'),
(3, '三食堂家常菜', 'canteen', '中餐', '20-40', 4.5, '校园三食堂二楼', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', '三食堂', '家常小炒', NULL, 'cilantro', '番茄炒蛋,土豆牛肉,青椒肉丝', '11:00-13:30 / 17:00-20:00', 24, '家常口味稳定，适合想好好吃顿饭的时候。'),
(4, '阿姨馄饨铺', 'canteen', '小吃', '0-20', 4.7, '一食堂早餐区', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80', '一食堂', '早餐馄饨', NULL, 'cilantro', '鲜肉馄饨,小笼包,紫菜蛋花汤', '06:00-22:00', 14, '汤清味鲜，早餐和夜宵都很合适。'),
(5, '清爽轻食馆', 'canteen', '轻食', '20-40', 4.0, '创新楼旁学生餐厅', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', '创新餐厅', '轻食沙拉', NULL, 'vegetarian', '鸡胸谷物饭,蔬菜沙拉,紫薯饭团', '10:00-21:00', 28, '清爽不腻，适合想吃轻一点的日子。'),
(6, '快乐炸鸡社', 'takeout', '快餐', '20-40', 4.3, '商业街 B12', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80', NULL, NULL, 28, 'spicy', '脆皮炸鸡,香辣鸡翅,薯条', '10:30-22:30', 32, '炸鸡热乎酥脆，适合奖励自己。'),
(7, '一碗日式咖喱', 'takeout', '日料', '20-40', 4.2, '地铁口美食城 3 层', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80', NULL, NULL, 35, 'vegetarian', '鸡肉咖喱饭,蔬菜咖喱饭,炸虾饭', '11:00-21:30', 36, '咖喱香浓，分量稳定，口味比较温和。'),
(8, '南门烤肉饭', 'takeout', '韩餐', '20-40', 4.1, '南门外 102 号', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=80', NULL, NULL, 30, 'spicy,cilantro', '烤肉饭,肥牛饭,泡菜拌饭', '10:30-21:30', 30, '肉量足，出餐速度快，午饭很省心。'),
(9, '老街砂锅粥', 'takeout', '粥粉面', '40-60', 4.5, '老街美食广场 A08', 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80', NULL, NULL, 40, 'seafood,cilantro', '海鲜砂锅粥,排骨粥,虾仁肠粉', '11:00-23:00', 42, '粥很热乎，晚上想吃清淡点可以选。'),
(10, '云上小火锅', 'takeout', '火锅', '60+', 4.8, '大学城广场 4 楼', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', NULL, NULL, 50, 'spicy,cilantro,seafood', '牛油锅,番茄锅,虾滑拼盘', '11:00-23:30', 56, '适合聚餐，菜品丰富，氛围比较热闹。');
