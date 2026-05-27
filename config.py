from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "what_to_eat.db"

DEFAULT_USER_ID = "demo_user"
PAGE_SIZE = 8
PRICE_ORDER = ["0-20", "20-40", "40-60", "60+"]

SOURCE_TYPES = {
    "canteen": "饭堂",
    "takeout": "外卖",
}

DIET_OPTIONS = {
    "not_spicy": "不吃辣",
    "no_cilantro": "不吃香菜",
    "vegetarian": "素食",
    "no_seafood": "海鲜过敏",
}


class AppConfig:
    JSON_AS_ASCII = False
    DATABASE = str(DB_PATH)
    DEFAULT_USER_ID = DEFAULT_USER_ID
    PAGE_SIZE = PAGE_SIZE
    PRICE_ORDER = PRICE_ORDER
    SOURCE_TYPES = SOURCE_TYPES
    DIET_OPTIONS = DIET_OPTIONS

