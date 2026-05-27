from dataclasses import dataclass, field
import random

from flask import current_app

from . import repositories
from what_to_eat.errors import ApiError


@dataclass
class RestaurantFilters:
    source_type: str = ""
    cuisine: str = ""
    price: str = ""
    keyword: str = ""
    diet_restrictions: list[str] = field(default_factory=list)
    blocked_ids: set[int] = field(default_factory=set)
    preferred_ids: set[int] = field(default_factory=set)


def split_csv_field(value):
    return [
        item.strip()
        for item in (value or "").split(",")
        if item.strip()
    ]


def normalize_restaurant(restaurant):
    """把逗号分隔字段转成数组，便于页面渲染。"""
    if not restaurant:
        return None
    restaurant = dict(restaurant)
    restaurant["diet_tags"] = split_csv_field(restaurant.get("diet_tags"))
    restaurant["signature_dishes"] = split_csv_field(
        restaurant.get("signature_dishes")
    )
    return restaurant


def normalize_restaurants(restaurants):
    return [normalize_restaurant(item) for item in restaurants]


def validate_filters(filters):
    source_types = current_app.config["SOURCE_TYPES"]
    if filters.source_type and filters.source_type not in source_types:
        raise ApiError("source_type 只能是 canteen 或 takeout")

    valid_diets = current_app.config["DIET_OPTIONS"]
    filters.diet_restrictions = [
        item for item in filters.diet_restrictions if item in valid_diets
    ]
    return filters


def get_meta():
    source_types = [
        {"value": value, "label": label}
        for value, label in current_app.config["SOURCE_TYPES"].items()
    ]
    diet_options = [
        {"value": value, "label": label}
        for value, label in current_app.config["DIET_OPTIONS"].items()
    ]
    return {
        "cuisines": repositories.find_distinct_cuisines(),
        "prices": repositories.find_distinct_prices(current_app.config["PRICE_ORDER"]),
        "source_types": source_types,
        "diet_options": diet_options,
    }


def get_categories():
    return repositories.find_distinct_cuisines()


def list_restaurants(filters):
    filters = validate_filters(filters)
    restaurants = repositories.find_restaurants(
        source_type=filters.source_type,
        cuisine=filters.cuisine,
        price=filters.price,
        keyword=filters.keyword,
        diet_restrictions=filters.diet_restrictions,
        blocked_ids=filters.blocked_ids,
        preferred_ids=filters.preferred_ids,
    )
    return normalize_restaurants(restaurants)


def paginate_restaurants(restaurants, page):
    """把餐馆列表按固定 8 条一页切分，返回前端需要的分页信息。"""
    page_size = current_app.config["PAGE_SIZE"]
    total = len(restaurants)
    total_pages = (total + page_size - 1) // page_size

    if total_pages == 0:
        page = 1
    else:
        page = max(1, min(page, total_pages))

    start = (page - 1) * page_size
    end = start + page_size

    return {
        "items": restaurants[start:end],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


def get_restaurant_detail(restaurant_id, user_id):
    restaurant = get_restaurant_or_404(restaurant_id)
    restaurant["is_favorite"] = repositories.favorite_exists(user_id, restaurant_id)
    return restaurant


def get_restaurant_or_404(restaurant_id):
    restaurant = normalize_restaurant(repositories.find_restaurant_by_id(restaurant_id))
    if not restaurant:
        raise ApiError("餐馆不存在", 404)
    return restaurant


def get_random_restaurants(filters, requested_count=None):
    restaurants = list_restaurants(filters)
    if not restaurants:
        raise ApiError("没有找到符合条件的餐馆", 404)

    if requested_count is None:
        count = random.randint(1, min(3, len(restaurants)))
    else:
        count = max(1, min(3, requested_count))

    preferred_ids = filters.preferred_ids
    preferred_candidates = [
        item for item in restaurants if item["id"] in preferred_ids
    ]
    other_candidates = [
        item for item in restaurants if item["id"] not in preferred_ids
    ]

    random.shuffle(preferred_candidates)
    random.shuffle(other_candidates)

    if preferred_candidates:
        selected = preferred_candidates[:count]
        selected += other_candidates[: max(0, count - len(selected))]
    else:
        selected = random.sample(restaurants, min(count, len(restaurants)))

    return selected[:count]


def get_recommendation(filters):
    restaurants = list_restaurants(filters)
    if not restaurants:
        raise ApiError("没有找到符合条件的餐馆", 404)

    preferred_candidates = [
        item for item in restaurants if item["id"] in filters.preferred_ids
    ]
    restaurant = random.choice(preferred_candidates or restaurants)
    return {
        "restaurant": restaurant,
        "candidate_count": len(restaurants),
    }


def toggle_favorite(user_id, restaurant_id, action="toggle"):
    get_restaurant_or_404(restaurant_id)
    action = str(action or "toggle").lower()
    should_favorite = None

    if action in ("add", "true"):
        should_favorite = True
    elif action in ("remove", "cancel", "false"):
        should_favorite = False

    favorited = repositories.set_favorite_state(
        user_id,
        restaurant_id,
        should_favorite,
    )
    return {
        "user_id": user_id,
        "restaurant_id": restaurant_id,
        "favorited": favorited,
    }


def get_favorites(user_id):
    return normalize_restaurants(repositories.find_favorites_by_user(user_id))
