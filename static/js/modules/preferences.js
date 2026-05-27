// 偏好数据模块：用 localStorage 保存筛选习惯、偏好店铺和屏蔽店铺。
const PREFERENCE_KEYS = {
    filters: "whatToEat.filters",
    preferredIds: "whatToEat.preferredRestaurantIds",
    blockedIds: "whatToEat.blockedRestaurantIds",
};

function readStorageJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorageJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedFilters() {
    return readStorageJson(PREFERENCE_KEYS.filters, {
        cuisine: "",
        price: "",
    });
}

export function saveFilters(filters) {
    writeStorageJson(PREFERENCE_KEYS.filters, {
        cuisine: filters.cuisine || "",
        price: filters.price || "",
    });
}

export function getPreferredRestaurantIds() {
    return readStorageJson(PREFERENCE_KEYS.preferredIds, []);
}

export function getBlockedRestaurantIds() {
    return readStorageJson(PREFERENCE_KEYS.blockedIds, []);
}

export function rememberRestaurantPreference(restaurantId) {
    const id = Number(restaurantId);
    if (!id || isRestaurantBlocked(id)) {
        return;
    }

    const ids = new Set(getPreferredRestaurantIds());
    ids.add(id);
    writeStorageJson(PREFERENCE_KEYS.preferredIds, Array.from(ids));
}

export function blockRestaurant(restaurantId) {
    const id = Number(restaurantId);
    if (!id) {
        return;
    }

    const blockedIds = new Set(getBlockedRestaurantIds());
    blockedIds.add(id);
    writeStorageJson(PREFERENCE_KEYS.blockedIds, Array.from(blockedIds));

    const preferredIds = getPreferredRestaurantIds().filter((item) => item !== id);
    writeStorageJson(PREFERENCE_KEYS.preferredIds, preferredIds);
}

export function unblockRestaurant(restaurantId) {
    const id = Number(restaurantId);
    if (!id) {
        return;
    }

    const blockedIds = getBlockedRestaurantIds().filter((item) => item !== id);
    writeStorageJson(PREFERENCE_KEYS.blockedIds, blockedIds);
}

export function isRestaurantBlocked(restaurantId) {
    return getBlockedRestaurantIds().includes(Number(restaurantId));
}

export function appendPreferenceParams(params, options = {}) {
    const blockedIds = getBlockedRestaurantIds();
    const preferredIds = getPreferredRestaurantIds();

    if (blockedIds.length) {
        params.set("blocked_ids", blockedIds.join(","));
    }
    if (options.includePreferred && preferredIds.length) {
        params.set("preferred_ids", preferredIds.join(","));
    }
}
