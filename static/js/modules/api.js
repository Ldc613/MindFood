// 后端接口请求模块：统一维护 API 地址、用户 id 和 fetch 错误处理。
export const API_BASE = "";
export const USER_ID = "demo_user";

export async function apiRequest(path, options = {}) {
    const { headers = {}, ...requestOptions } = options;
    const response = await fetch(`${API_BASE}${path}`, {
        ...requestOptions,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || "请求失败");
    }

    // 新后端统一返回 { success, message, data }，这里解包后保持页面调用方式不变。
    if (Object.prototype.hasOwnProperty.call(data, "success")
        && Object.prototype.hasOwnProperty.call(data, "data")) {
        return data.data;
    }
    return data;
}

export function fetchMeta() {
    return apiRequest("/api/meta");
}

export function fetchRestaurants(query = "") {
    return apiRequest(`/api/restaurants${query}`);
}

export function fetchRandomRestaurants(query = "") {
    return apiRequest(`/api/restaurants/random${query}`);
}

export function fetchRestaurantDetail(restaurantId, userId = USER_ID) {
    return apiRequest(`/api/restaurants/${restaurantId}?user_id=${encodeURIComponent(userId)}`);
}

export function fetchFavorites(userId = USER_ID) {
    return apiRequest(`/api/favorites?user_id=${encodeURIComponent(userId)}`);
}

export function submitFavorite(payload) {
    return apiRequest("/api/favorite", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
