import {
    fetchMeta,
    fetchRestaurants,
    fetchRandomRestaurants,
} from "../modules/api.js";
import {
    blockRestaurant,
    getBlockedRestaurantIds,
    getSavedFilters,
    rememberRestaurantPreference,
    saveFilters,
    unblockRestaurant,
} from "../modules/preferences.js";
import {
    buildRestaurantQuery,
    getSourceTitle,
} from "../modules/restaurants.js";
import {
    buildRestaurantCard,
    clearError,
    fillDietOptions,
    fillSelect,
    getSelectedDietRestrictions,
    renderBlockedItem,
    renderPagination,
    setLoading,
    showError,
} from "../modules/ui.js";
import {
    debounce,
    getElement,
    getElements,
    onReady,
} from "../modules/utils.js";

const state = {
    activeSource: "",
    currentPage: 1,
};

const elements = {};

onReady(initHomePage);

async function initHomePage() {
    cacheElements();
    bindEvents();

    await loadMeta();
    restoreSavedFilters();
    updateSourceTabs();
    updateBlockedManageButton();
    await loadRestaurants();
}

function cacheElements() {
    elements.searchInput = getElement("#searchInput");
    elements.cuisineFilter = getElement("#cuisineFilter");
    elements.priceFilter = getElement("#priceFilter");
    elements.randomBtn = getElement("#randomBtn");
    elements.restaurantList = getElement("#restaurantList");
    elements.randomList = getElement("#randomList");
    elements.randomSection = getElement("#randomSection");
    elements.restaurantCount = getElement("#restaurantCount");
    elements.dietFilterList = getElement("#dietFilterList");
    elements.blockedManageBtn = getElement("#blockedManageBtn");
    elements.blockedPanel = getElement("#blockedPanel");
    elements.blockedList = getElement("#blockedList");
    elements.closeBlockedPanelBtn = getElement("#closeBlockedPanelBtn");
    elements.sourceTabs = getElements(".source-tab");
    elements.sourceTitle = getElement("#sourceTitle");
}

function bindEvents() {
    elements.cuisineFilter.addEventListener("change", () => {
        resetToFirstPage();
        saveCurrentFilters();
        loadRestaurants();
    });

    elements.priceFilter.addEventListener("change", () => {
        resetToFirstPage();
        saveCurrentFilters();
        loadRestaurants();
    });

    elements.searchInput.addEventListener("input", debounce(() => {
        resetToFirstPage();
        loadRestaurants();
    }));

    elements.randomBtn.addEventListener("click", loadRandomRestaurants);

    elements.dietFilterList.addEventListener("change", () => {
        resetToFirstPage();
        elements.randomSection.classList.add("hidden");
        loadRestaurants();
    });

    elements.sourceTabs.forEach((button) => {
        button.addEventListener("click", () => {
            state.activeSource = button.dataset.source;
            resetToFirstPage();
            updateSourceTabs();
            elements.randomSection.classList.add("hidden");
            loadRestaurants();
        });
    });

    elements.restaurantList.addEventListener("click", handleRestaurantCardAction);
    elements.randomList.addEventListener("click", handleRestaurantCardAction);
    elements.blockedManageBtn.addEventListener("click", toggleBlockedPanel);
    elements.closeBlockedPanelBtn.addEventListener("click", () => {
        elements.blockedPanel.classList.add("hidden");
    });
    elements.blockedList.addEventListener("click", handleUnblockClick);
}

async function loadMeta() {
    try {
        const meta = await fetchMeta();
        fillSelect(elements.cuisineFilter, meta.cuisines, "全部菜系");
        fillSelect(elements.priceFilter, meta.prices, "全部价格");
        fillDietOptions(elements.dietFilterList, meta.diet_options || []);
    } catch (error) {
        showError(error.message);
    }
}

async function loadRestaurants() {
    clearError();
    setLoading(true, "加载餐馆中");
    updateSourceTitle();

    try {
        const data = await fetchRestaurants(buildCurrentQuery({
            includePage: true,
            includePreferred: true,
        }));
        const restaurants = data.items || [];

        elements.restaurantCount.textContent = data.total_pages
            ? `共 ${data.total} 家 · 第 ${data.page}/${data.total_pages} 页`
            : "共 0 家";
        elements.restaurantList.innerHTML = restaurants.length
            ? restaurants.map((item) => buildRestaurantCard(item)).join("")
            : `<div class="empty-panel sm:col-span-2 lg:col-span-3">没有符合条件的餐馆，换个关键词或筛选条件试试。</div>`;
        renderPagination(data, handlePageChange);
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

async function loadRandomRestaurants() {
    clearError();
    elements.randomBtn.disabled = true;
    elements.randomBtn.textContent = "推荐中";
    setLoading(true, "随机推荐中");

    try {
        const restaurants = await fetchRandomRestaurants(buildCurrentQuery({
            includePreferred: true,
        }));
        elements.randomSection.classList.remove("hidden");
        elements.randomList.innerHTML = restaurants
            .map((item) => buildRestaurantCard(item))
            .join("");
    } catch (error) {
        showError(error.message);
    } finally {
        elements.randomBtn.disabled = false;
        elements.randomBtn.textContent = "随机推荐";
        setLoading(false);
    }
}

function buildCurrentQuery(options = {}) {
    return buildRestaurantQuery({
        sourceType: state.activeSource,
        keyword: elements.searchInput.value.trim(),
        cuisine: elements.cuisineFilter.value,
        price: elements.priceFilter.value,
        diets: getSelectedDietRestrictions(elements.dietFilterList),
        page: state.currentPage,
    }, options);
}

function resetToFirstPage() {
    state.currentPage = 1;
}

function updateSourceTabs() {
    elements.sourceTabs.forEach((button) => {
        const isActive = button.dataset.source === state.activeSource;
        button.classList.toggle("is-active", isActive);
    });
}

function updateSourceTitle() {
    elements.sourceTitle.textContent = getSourceTitle(state.activeSource);
}

function restoreSavedFilters() {
    const filters = getSavedFilters();
    elements.cuisineFilter.value = filters.cuisine || "";
    elements.priceFilter.value = filters.price || "";
}

function saveCurrentFilters() {
    // 只记忆课程需求中的菜系和价格，搜索词保持临时状态。
    saveFilters({
        cuisine: elements.cuisineFilter.value,
        price: elements.priceFilter.value,
    });
}

function handleRestaurantCardAction(event) {
    const dislikeButton = event.target.closest(".not-interested-button");
    if (dislikeButton) {
        blockRestaurant(Number(dislikeButton.dataset.id));
        updateBlockedManageButton();
        elements.randomSection.classList.add("hidden");
        resetToFirstPage();
        loadRestaurants();
        return;
    }

    const detailLink = event.target.closest(".track-restaurant");
    if (detailLink) {
        rememberRestaurantPreference(Number(detailLink.dataset.id));
    }
}

function updateBlockedManageButton() {
    const count = getBlockedRestaurantIds().length;
    elements.blockedManageBtn.textContent = `已屏蔽 ${count}`;
    elements.blockedManageBtn.disabled = count === 0;

    if (count === 0) {
        elements.blockedPanel.classList.add("hidden");
    }
}

async function toggleBlockedPanel() {
    if (getBlockedRestaurantIds().length === 0) {
        return;
    }

    const shouldShow = elements.blockedPanel.classList.contains("hidden");
    elements.blockedPanel.classList.toggle("hidden", !shouldShow);

    if (shouldShow) {
        await renderBlockedRestaurants();
    }
}

async function renderBlockedRestaurants() {
    const blockedIds = getBlockedRestaurantIds();
    if (!blockedIds.length) {
        elements.blockedList.innerHTML = `<div class="empty-panel sm:col-span-2 lg:col-span-3">当前没有屏蔽的店铺。</div>`;
        return;
    }

    try {
        const restaurants = await fetchRestaurants();
        const blockedRestaurants = restaurants.filter((item) => blockedIds.includes(item.id));

        elements.blockedList.innerHTML = blockedRestaurants.length
            ? blockedRestaurants.map(renderBlockedItem).join("")
            : `<div class="empty-panel sm:col-span-2 lg:col-span-3">本地记录里有屏蔽项，但当前数据库没有对应店铺。</div>`;
    } catch (error) {
        showError(error.message);
    }
}

async function handleUnblockClick(event) {
    const button = event.target.closest(".unblock-button");
    if (!button) {
        return;
    }

    unblockRestaurant(Number(button.dataset.id));
    updateBlockedManageButton();
    await renderBlockedRestaurants();
    resetToFirstPage();
    await loadRestaurants();
}

function handlePageChange(page) {
    state.currentPage = page;
    loadRestaurants();
    window.scrollTo({ top: 0, behavior: "smooth" });
}
