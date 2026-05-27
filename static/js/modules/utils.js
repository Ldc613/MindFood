// 通用工具函数：不依赖具体页面，多个模块都可以复用。
export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function onReady(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
        return;
    }
    callback();
}

export function debounce(callback, delay = 300) {
    let timer = null;

    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => callback(...args), delay);
    };
}

export function getElement(selector, root = document) {
    const element = root.querySelector(selector);
    if (!element) {
        throw new Error(`页面缺少元素：${selector}`);
    }
    return element;
}

export function getElements(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}
