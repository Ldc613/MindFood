import { appendPreferenceParams } from "./preferences.js";

const SOURCE_TITLES = {
    "": "全部餐馆",
    canteen: "饭堂餐馆",
    takeout: "外卖餐馆",
};

const DIET_TAG_LABELS = {
    spicy: "含辣",
    cilantro: "含香菜",
    vegetarian: "素食友好",
    seafood: "含海鲜",
};

// 把页面筛选状态转换成接口查询字符串。
export function buildRestaurantQuery(filters = {}, options = {}) {
    const params = new URLSearchParams();
    const {
        sourceType = "",
        keyword = "",
        cuisine = "",
        price = "",
        diets = [],
        page = 1,
    } = filters;

    if (sourceType) {
        params.set("source_type", sourceType);
    }
    if (keyword) {
        params.set("keyword", keyword);
    }
    if (cuisine) {
        params.set("cuisine", cuisine);
    }
    if (price) {
        params.set("price", price);
    }
    if (diets.length) {
        params.set("diet", diets.join(","));
    }
    if (options.includePage) {
        params.set("page", page);
    }

    appendPreferenceParams(params, {
        includePreferred: options.includePreferred,
    });

    const query = params.toString();
    return query ? `?${query}` : "";
}

export function getSourceTitle(sourceType) {
    return SOURCE_TITLES[sourceType] || SOURCE_TITLES[""];
}

export function getSourceLabel(sourceType) {
    return sourceType === "canteen" ? "饭堂" : "外卖";
}

export function getSourceBadgeClass(sourceType) {
    return sourceType === "canteen" ? "badge-source-canteen" : "badge-source-takeout";
}

export function getSourceDetail(item) {
    if (item.source_type === "canteen") {
        return [item.canteen_name, item.window_name].filter(Boolean).join(" / ") || "校内饭堂";
    }
    if (item.delivery_time_min) {
        return `预计 ${item.delivery_time_min} 分钟送达`;
    }
    return "外卖店铺";
}

export function getDietTagLabels(tags) {
    const tagList = Array.isArray(tags) ? tags : [];
    return tagList
        .filter((tag) => DIET_TAG_LABELS[tag])
        .map((tag) => ({
            value: tag,
            label: DIET_TAG_LABELS[tag],
        }));
}
