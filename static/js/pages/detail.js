import {
    USER_ID,
    fetchRestaurantDetail,
    submitFavorite,
} from "../modules/api.js";
import { rememberRestaurantPreference } from "../modules/preferences.js";
import {
    getSourceBadgeClass,
    getSourceDetail,
    getSourceLabel,
} from "../modules/restaurants.js";
import {
    clearError,
    showError,
} from "../modules/ui.js";
import {
    escapeHtml,
    getElement,
    onReady,
} from "../modules/utils.js";

const state = {
    currentRestaurant: null,
};

const elements = {};

onReady(initDetailPage);

async function initDetailPage() {
    cacheElements();
    bindBackButton();
    showLoadingState();
    await loadRestaurantDetail();
    elements.favoriteBtn.addEventListener("click", handleFavoriteClick);
}

function cacheElements() {
    elements.restaurantId = document.body.dataset.restaurantId;
    elements.detailBox = getElement("#detailBox");
    elements.detailSkeleton = getElement("#detailSkeleton");
    elements.loadingBox = getElement("#loadingBox");
    elements.favoriteBtn = getElement("#favoriteBtn");
    elements.backBtn = getElement("#backBtn");
}

function bindBackButton() {
    elements.backBtn.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        window.location.href = "/";
    });
}

function showLoadingState() {
    clearError();
    elements.loadingBox.classList.remove("hidden");
    elements.detailSkeleton.classList.remove("hidden");
    elements.detailBox.classList.add("hidden");
}

function hideLoadingState() {
    elements.loadingBox.classList.add("hidden");
    elements.detailSkeleton.classList.add("hidden");
}

async function loadRestaurantDetail() {
    try {
        state.currentRestaurant = await fetchRestaurantDetail(elements.restaurantId, USER_ID);
        rememberRestaurantPreference(state.currentRestaurant.id);
        renderDetail(state.currentRestaurant);
        elements.detailBox.classList.remove("hidden");
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoadingState();
    }
}

async function handleFavoriteClick() {
    if (!state.currentRestaurant) {
        return;
    }

    elements.favoriteBtn.disabled = true;
    try {
        const result = await submitFavorite({
            user_id: USER_ID,
            restaurant_id: state.currentRestaurant.id,
        });
        state.currentRestaurant.is_favorite = result.favorited;
        if (result.favorited) {
            rememberRestaurantPreference(state.currentRestaurant.id);
        }
        updateFavoriteButton(result.favorited);
    } catch (error) {
        showError(error.message);
    } finally {
        elements.favoriteBtn.disabled = false;
    }
}

function renderDetail(item) {
    getElement("#restaurantImage").src = item.image_url;
    getElement("#restaurantImage").alt = item.name;
    getElement("#restaurantName").textContent = item.name;
    getElement("#restaurantAddress").textContent = item.address;
    getElement("#restaurantSource").textContent = getSourceLabel(item.source_type);
    getElement("#restaurantCuisine").textContent = item.cuisine;
    getElement("#restaurantPrice").textContent = `${item.price_range} 元`;
    getElement("#restaurantAvgSpend").textContent = item.avg_spend ? `¥ ${item.avg_spend}` : "暂无";
    getElement("#restaurantOpeningHours").textContent = item.opening_hours || "暂无";
    getElement("#restaurantRating").textContent = item.rating;

    const sourceBadge = getElement("#restaurantSourceBadge");
    sourceBadge.className = `badge ${getSourceBadgeClass(item.source_type)}`;
    sourceBadge.textContent = `${getSourceLabel(item.source_type)}推荐`;

    getElement("#restaurantQuickInfo").textContent = getSourceDetail(item);
    renderSignatureDishes(item.signature_dishes || []);
    renderReviewSummary(item.review_summary);
    updateFavoriteButton(item.is_favorite);
}

function renderSignatureDishes(dishes) {
    const container = getElement("#signatureDishesList");
    const list = Array.isArray(dishes) ? dishes : [];

    container.innerHTML = list.length
        ? list.map((dish) => `<span class="badge badge-cuisine">${escapeHtml(dish)}</span>`).join("")
        : `<span class="badge badge-cuisine">暂无招牌菜</span>`;
}

function renderReviewSummary(review) {
    getElement("#reviewSummary").textContent = review || "这家店整体评价比较稳定，适合想吃一顿安心饭的时候。";
}

function updateFavoriteButton(isFavorite) {
    elements.favoriteBtn.textContent = isFavorite ? "取消收藏" : "收藏";
    elements.favoriteBtn.setAttribute("aria-pressed", String(isFavorite));
}
