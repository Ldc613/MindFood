from contextlib import closing

from what_to_eat.database import fetch_all, fetch_one, get_db_connection


RESTAURANT_FIELDS = (
    "id",
    "name",
    "source_type",
    "cuisine",
    "price_range",
    "rating",
    "address",
    "image_url",
    "canteen_name",
    "window_name",
    "delivery_time_min",
    "diet_tags",
    "signature_dishes",
    "opening_hours",
    "avg_spend",
    "review_summary",
)
RESTAURANT_COLUMNS = ", ".join(RESTAURANT_FIELDS)
RESTAURANT_COLUMNS_WITH_ALIAS = ", ".join(
    f"r.{field}" for field in RESTAURANT_FIELDS
)


def find_restaurants(
    source_type="",
    cuisine="",
    price="",
    keyword="",
    diet_restrictions=None,
    blocked_ids=None,
    preferred_ids=None,
):
    """按筛选条件查询餐馆，饮食忌口和屏蔽 id 直接在 SQL 层处理。"""
    sql_parts = [f"SELECT {RESTAURANT_COLUMNS} FROM restaurants WHERE 1 = 1"]
    params = []
    diet_restrictions = set(diet_restrictions or [])
    blocked_ids = sorted(blocked_ids or [])
    preferred_ids = sorted(preferred_ids or [])

    if source_type:
        sql_parts.append("AND source_type = ?")
        params.append(source_type)
    if cuisine:
        sql_parts.append("AND cuisine = ?")
        params.append(cuisine)
    if price:
        sql_parts.append("AND price_range = ?")
        params.append(price)
    if keyword:
        sql_parts.append("AND (name LIKE ? OR cuisine LIKE ?)")
        params.extend([f"%{keyword}%", f"%{keyword}%"])
    if blocked_ids:
        placeholders = ",".join("?" for _ in blocked_ids)
        sql_parts.append(f"AND id NOT IN ({placeholders})")
        params.extend(blocked_ids)

    tag_expr = "',' || COALESCE(diet_tags, '') || ','"
    if "not_spicy" in diet_restrictions:
        sql_parts.append(f"AND {tag_expr} NOT LIKE '%,spicy,%'")
    if "no_cilantro" in diet_restrictions:
        sql_parts.append(f"AND {tag_expr} NOT LIKE '%,cilantro,%'")
    if "no_seafood" in diet_restrictions:
        sql_parts.append(f"AND {tag_expr} NOT LIKE '%,seafood,%'")
    if "vegetarian" in diet_restrictions:
        sql_parts.append(f"AND {tag_expr} LIKE '%,vegetarian,%'")

    if preferred_ids:
        placeholders = ",".join("?" for _ in preferred_ids)
        sql_parts.append(
            f"ORDER BY CASE WHEN id IN ({placeholders}) THEN 0 ELSE 1 END, rating DESC, id ASC"
        )
        params.extend(preferred_ids)
    else:
        sql_parts.append("ORDER BY rating DESC, id ASC")

    return fetch_all("\n".join(sql_parts), params)


def find_restaurant_by_id(restaurant_id):
    return fetch_one(
        f"SELECT {RESTAURANT_COLUMNS} FROM restaurants WHERE id = ?",
        (restaurant_id,),
    )


def find_distinct_cuisines():
    rows = fetch_all(
        "SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine"
    )
    return [row["cuisine"] for row in rows]


def find_distinct_prices(price_order):
    order_cases = " ".join(
        f"WHEN '{price}' THEN {index}"
        for index, price in enumerate(price_order, start=1)
    )
    rows = fetch_all(
        f"""
        SELECT DISTINCT price_range
        FROM restaurants
        ORDER BY CASE price_range {order_cases} ELSE 99 END, price_range
        """
    )
    return [row["price_range"] for row in rows]


def favorite_exists(user_id, restaurant_id):
    row = fetch_one(
        """
        SELECT 1 AS exists_flag
        FROM favorites
        WHERE user_id = ? AND restaurant_id = ?
        """,
        (user_id, restaurant_id),
    )
    return row is not None


def set_favorite_state(user_id, restaurant_id, should_favorite=None):
    """在一个连接中完成收藏切换，避免重复打开数据库连接。"""
    with closing(get_db_connection()) as conn:
        exists = conn.execute(
            """
            SELECT 1
            FROM favorites
            WHERE user_id = ? AND restaurant_id = ?
            """,
            (user_id, restaurant_id),
        ).fetchone() is not None

        if should_favorite is True:
            conn.execute(
                """
                INSERT OR IGNORE INTO favorites (user_id, restaurant_id)
                VALUES (?, ?)
                """,
                (user_id, restaurant_id),
            )
            favorited = True
        elif should_favorite is False:
            conn.execute(
                """
                DELETE FROM favorites
                WHERE user_id = ? AND restaurant_id = ?
                """,
                (user_id, restaurant_id),
            )
            favorited = False
        elif exists:
            conn.execute(
                """
                DELETE FROM favorites
                WHERE user_id = ? AND restaurant_id = ?
                """,
                (user_id, restaurant_id),
            )
            favorited = False
        else:
            conn.execute(
                """
                INSERT INTO favorites (user_id, restaurant_id)
                VALUES (?, ?)
                """,
                (user_id, restaurant_id),
            )
            favorited = True

        conn.commit()
    return favorited


def find_favorites_by_user(user_id):
    return fetch_all(
        f"""
        SELECT {RESTAURANT_COLUMNS_WITH_ALIAS}, f.created_at AS favorited_at
        FROM favorites f
        JOIN restaurants r ON r.id = f.restaurant_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC, r.id ASC
        """,
        (user_id,),
    )
