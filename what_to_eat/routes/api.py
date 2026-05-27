from flask import Blueprint, current_app, request

from what_to_eat.errors import ApiError
from what_to_eat.responses import success_response
from what_to_eat.services import RestaurantFilters
from what_to_eat import services


api_bp = Blueprint("api", __name__, url_prefix="/api")


def get_request_json():
    return request.get_json(silent=True) or {}


def get_user_id():
    """课程项目没有登录系统，默认用 demo_user 模拟一个用户。"""
    data = get_request_json()
    user_id = (
        request.args.get("user_id")
        or data.get("user_id")
        or current_app.config["DEFAULT_USER_ID"]
    )
    user_id = str(user_id).strip()
    if not user_id:
        raise ApiError("user_id 不能为空")
    return user_id


def parse_text_list(param_name):
    return [
        item.strip()
        for item in request.args.get(param_name, "").split(",")
        if item.strip()
    ]


def parse_id_list(param_name):
    """解析前端用逗号传来的店铺 id 列表，非法值会被自动忽略。"""
    ids = []
    for item in request.args.get(param_name, "").split(","):
        item = item.strip()
        if not item:
            continue
        try:
            ids.append(int(item))
        except ValueError:
            continue
    return set(ids)


def get_filter_params():
    return RestaurantFilters(
        source_type=(request.args.get("source_type") or "").strip(),
        cuisine=(request.args.get("cuisine") or "").strip(),
        price=(
            request.args.get("price")
            or request.args.get("price_range")
            or ""
        ).strip(),
        keyword=(
            request.args.get("keyword")
            or request.args.get("search")
            or ""
        ).strip(),
        diet_restrictions=parse_text_list("diet"),
        blocked_ids=parse_id_list("blocked_ids"),
        preferred_ids=parse_id_list("preferred_ids"),
    )


@api_bp.get("/meta")
def meta():
    return success_response(services.get_meta())


@api_bp.get("/categories")
def categories():
    """兼容旧版本接口，返回所有菜系。"""
    return success_response(services.get_categories())


@api_bp.get("/restaurants")
def restaurants():
    restaurants_data = services.list_restaurants(get_filter_params())

    # 首页列表传 page 时启用分页；不传 page 时返回完整列表。
    if "page" in request.args:
        page = request.args.get("page", default=1, type=int) or 1
        restaurants_data = services.paginate_restaurants(restaurants_data, page)

    return success_response(restaurants_data)


@api_bp.get("/restaurants/<int:restaurant_id>")
def restaurant_detail(restaurant_id):
    return success_response(
        services.get_restaurant_detail(restaurant_id, get_user_id())
    )


@api_bp.get("/restaurants/random")
def random_restaurants():
    return success_response(
        services.get_random_restaurants(
            get_filter_params(),
            request.args.get("count", type=int),
        )
    )


@api_bp.get("/recommend")
def recommend():
    """兼容旧版本接口，返回一条随机推荐。"""
    return success_response(services.get_recommendation(get_filter_params()))


@api_bp.post("/favorite")
def toggle_favorite():
    data = get_request_json()

    try:
        restaurant_id = int(data.get("restaurant_id"))
    except (TypeError, ValueError):
        raise ApiError("restaurant_id 必须是数字")

    return success_response(
        services.toggle_favorite(
            user_id=get_user_id(),
            restaurant_id=restaurant_id,
            action=data.get("action") or "toggle",
        )
    )


@api_bp.get("/favorites")
def favorites():
    return success_response(services.get_favorites(get_user_id()))
