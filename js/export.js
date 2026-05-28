/**
 * 导出功能模块
 * 负责下载图表和数据
 */

const exporter = {
    /**
     * 下载SVG文件
     */
    downloadSVG() {
        const svgContent = VennRenderer.getSVGContent();
        if (!svgContent) {
            alert('没有可导出的图表');
            return;
        }

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'venn_diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * 下载PNG文件
     */
    downloadPNG() {
        VennRenderer.exportToPNG(function(dataUrl) {
            if (!dataUrl) {
                alert('导出PNG失败');
                return;
            }

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'venn_diagram.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    },

    /**
     * 下载CSV文件
     */
    downloadCSV() {
        if (!app.lastResults) {
            alert('没有可导出的分析结果');
            return;
        }

        const { intersections } = app.lastResults;

        // 构建CSV内容
        let csv = 'Intersection,Gene Count,Genes\n';

        intersections.forEach(intersection => {
            const name = intersection.label.replace(/,/g, ';');
            const genes = intersection.genes.join(';');
            csv += `"${name}",${intersection.count},"${genes}"\n`;
        });

        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'intersection_results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * 复制单个交集的基因列表
     * @param {string[]} genes - 基因数组
     * @param {string} label - 交集标签
     */
    copyIntersection(genes, label) {
        const text = genes.join('\n');

        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`已复制 ${label} 的 ${genes.length} 个基因`);
        }).catch(() => {
            // 备用方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast(`已复制 ${label} 的 ${genes.length} 个基因`);
        });
    },

    /**
     * 复制所有交集的基因列表
     */
    copyAllIntersections() {
        if (!app.lastResults) {
            alert('没有可复制的分析结果');
            return;
        }

        const { intersections } = app.lastResults;

        let text = '基因交集分析结果\n';
        text += '==================\n\n';

        intersections.forEach(intersection => {
            text += `${intersection.label} (${intersection.count} genes):\n`;
            text += intersection.genes.join(', ') + '\n\n';
        });

        navigator.clipboard.writeText(text).then(() => {
            this.showToast('已复制所有交集结果');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('已复制所有交集结果');
        });
    },

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     */
    showToast(message) {
        // 移除已有的toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2d3748;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 9999;
            animation: fadeInOut 2s ease-in-out;
        `;

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 2000);
    }
};
