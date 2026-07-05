import { Tooltip } from "bootstrap";

const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => htmlEscapeMap[character] ?? character);
}

export function formatDuration(seconds: number): string {
    const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function hideTooltips(): void {
    const tooltips = document.querySelectorAll(".tooltip");
    tooltips.forEach((tooltip) => {
        tooltip.remove();
    });
}

export function disposeTooltips(): void {
    document.body
        .querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach((el) => {
            const tooltipInstance = Tooltip.getInstance(el);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
        });
}
