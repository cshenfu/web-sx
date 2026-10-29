/**
 * 双击缩放临时开关，绘制期间关闭以免误触。
 */

export const doubleClickZoom = {
    /**
     * 恢复双击缩放（若初始配置允许）。
     *
     * @param {object} ctx draw 模式上下文（this）
     * @returns {void}
     */
    enable(ctx) {
        setTimeout(() => {
            if (
                !ctx.map
                || !ctx.map.doubleClickZoom
                || !ctx._ctx
                || !ctx._ctx.store
                || !ctx._ctx.store.getInitialConfigValue
            ) {
                return;
            }
            if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom')) {
                return;
            }
            ctx.map.doubleClickZoom.enable();
        }, 0);
    },

    /**
     * 禁用双击缩放。
     *
     * @param {object} ctx draw 模式上下文（this）
     * @returns {void}
     */
    disable(ctx) {
        setTimeout(() => {
            if (!ctx.map || !ctx.map.doubleClickZoom) {
                return;
            }
            ctx.map.doubleClickZoom.disable();
        }, 0);
    },
};
