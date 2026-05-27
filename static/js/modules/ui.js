import {
    getDietTagLabels,
    getSourceBadgeClass,
    getSourceDetail,
    getSourceLabel,
} from "./restaurants.js";
import { escapeHtml } from "./utils.js";

// 页面提示与加载状态。
export function showError(message) {
    const errorBox = document.querySelector("#errorBox");
    if (!errorBox) {
        return;
    }
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

export function clearError() {
    const errorBox = document.querySelector("#errorBox");
    if (errorBox) {
        errorBox.textContent = "";
        errorBox.classList.add("hidden");
    }
}

export function setLoading(isLoading, text) {
    const loadingBox = document.querySelector("#loadingBox");
    if (!loadingBox) {
        return;
    }
    if (text) {
        loadingBox.innerHTML = `<span class="loading-spinner mr-2 inline-block align-middle"></span>${escapeHtml(text)}`;
    }
    loadingBox.classList.toggle("hidden", !isLoading);
}

export function fillSelect(select, values, placeholder) {
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    (values || []).forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

export function fillDietOptions(container, options) {
    container.innerHTML = (options || [])
        .map((option) => `
            <label class="diet-option">
                <input type="checkbox" name="dietRestriction" value="${escapeHtml(option.value)}">
                <span>${escapeHtml(option.label)}</span>
            </label>
        `)
        .join("");
}

export function getSelectedDietRestrictions(container) {
    return Array.from(
        container.querySelectorAll("input[name='dietRestriction']:checked")
    ).map((input) => input.value);
}

export function buildRestaurantCard(item, options = {}) {
    const actionButton = options.showRemove
        ? `<button class="remove-favorite rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50" data-id="${item.id}">取消收藏</button>`
        : "";
    const dislikeButton = options.showNotInterested === false
        ? ""
        : `<button class="not-interested-button" type="button" data-id="${item.id}">不感兴趣</button>`;
    const sourceBadge = `<span class="badge ${getSourceBadgeClass(item.source_type)}">${getSourceLabel(item.source_type)}</span>`;
    const sourceDetail = getSourceDetail(item);
    const dietBadges = buildDietBadges(item.diet_tags);

    return `
        <article class="restaurant-card" data-restaurant-id="${item.id}">
            <a class="restaurant-image-wrap track-restaurant" href="/restaurant/${item.id}" data-id="${item.id}">
                <img class="restaurant-image" src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}">
            </a>
            <div class="restaurant-content">
                <div class="flex items-start justify-between gap-3">
                    <h3 class="restaurant-title">${escapeHtml(item.name)}</h3>
                    <div class="badge-row shrink-0 justify-end">
                        ${sourceBadge}
                        <span class="badge badge-cuisine">${escapeHtml(item.cuisine)}</span>
                    </div>
                </div>
                <p class="restaurant-address">${escapeHtml(item.address)}</p>
                <p class="restaurant-source">${escapeHtml(sourceDetail)}</p>
                <div class="badge-row mt-3">
                    <span class="badge badge-price">${escapeHtml(item.price_range)} 元</span>
                    <span class="badge badge-rating">评分 ${escapeHtml(item.rating)}</span>
                    ${dietBadges}
                </div>
                <div class="mt-4 flex items-center justify-between gap-3">
                    <a class="track-restaurant text-sm font-bold text-orange-700 hover:text-orange-900" href="/restaurant/${item.id}" data-id="${item.id}">查看详情</a>
                    <div class="flex flex-wrap justify-end gap-2">
                        ${dislikeButton}
                        ${actionButton}
                    </div>
                </div>
            </div>
        </article>
    `;
}

export function buildDietBadges(tags) {
    return getDietTagLabels(tags)
        .map((tag) => `<span class="badge badge-diet">${escapeHtml(tag.label)}</span>`)
        .join("");
}

export function renderBlockedItem(item) {
    const sourceLabel = getSourceLabel(item.source_type);
    return `
        <article class="blocked-item">
            <div>
                <h4 class="blocked-item-title">${escapeHtml(item.name)}</h4>
                <p class="blocked-item-meta">${sourceLabel} · ${escapeHtml(item.cuisine)} · ${escapeHtml(item.price_range)} 元</p>
            </div>
            <button class="unblock-button" type="button" data-id="${item.id}">取消屏蔽</button>
        </article>
    `;
}

export function renderPagination(data, onPageChange) {
    const paginationBox = document.querySelector("#paginationBox");
    if (!paginationBox) {
        return;
    }

    paginationBox.innerHTML = "";
    if (!data || data.total_pages <= 1) {
        return;
    }

    paginationBox.appendChild(
        createPageButton("上一页", data.page - 1, data.page === 1, false, onPageChange)
    );

    for (let page = 1; page <= data.total_pages; page += 1) {
        paginationBox.appendChild(
            createPageButton(String(page), page, false, page === data.page, onPageChange)
        );
    }

    paginationBox.appendChild(
        createPageButton("下一页", data.page + 1, data.page === data.total_pages, false, onPageChange)
    );
}

function createPageButton(label, page, disabled, isActive, onPageChange) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "page-button";
    button.disabled = disabled;
    button.classList.toggle("is-active", isActive);
    button.addEventListener("click", () => {
        if (disabled || isActive) {
            return;
        }
        onPageChange(page);
    });
    return button;
}
