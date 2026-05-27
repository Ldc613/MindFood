import {
    USER_ID,
    fetchFavorites,
    submitFavorite,
} from "../modules/api.js";
import { rememberRestaurantPreference } from "../modules/preferences.js";
import {
    buildRestaurantCard,
    clearError,
    setLoading,
    showError,
} from "../modules/ui.js";
import {
    getElement,
    onReady,
} from "../modules/utils.js";

const elements = {};

onReady(initFavoritesPage);

async function initFavoritesPage() {
    cacheElements();
    await loadFavorites();
    elements.favoriteList.addEventListener("click", handleRemoveFavorite);
}

function cacheElements() {
    elements.favoriteList = getElement("#favoriteList");
    elements.emptyBox = getElement("#emptyBox");
}

async function loadFavorites() {
    clearError();
    setLoading(true, "加载收藏中");

    try {
        const favorites = await fetchFavorites(USER_ID);
        favorites.forEach((item) => rememberRestaurantPreference(item.id));
        elements.emptyBox.classList.toggle("hidden", favorites.length > 0);
        elements.favoriteList.innerHTML = favorites
            .map((item) => buildRestaurantCard(item, {
                showRemove: true,
                showNotInterested: false,
            }))
            .join("");
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

async function handleRemoveFavorite(event) {
    const button = event.target.closest(".remove-favorite");
    if (!button) {
        return;
    }

    button.disabled = true;
    try {
        await submitFavorite({
            user_id: USER_ID,
            restaurant_id: Number(button.dataset.id),
            action: "remove",
        });
        await loadFavorites();
    } catch (error) {
        showError(error.message);
        button.disabled = false;
    }
}
