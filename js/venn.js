/**
 * 韦恩图绘制模块
 * 使用 venn.js 库绘制韦恩图
 */

const VennRenderer = {
    chart: null,

    /**
     * 绘制韦恩图
     * @param {string} containerId - 容器ID
     * @param {Object[]} sets - 集合数据 [{name, genes, color}]
     * @param {Object} options - 配置选项
     */
    render(containerId, sets, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 默认选项
        const defaultOptions = {
            width: 600,
            height: 500,
            fontSize: 14,
            showLabels: true,
            showCounts: true,
            padding: 20
        };

        const config = { ...defaultOptions, ...options };

        // 生成韦恩图数据
        const vennData = GeneAnalyzer.generateVennData(sets);

        if (vennData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">没有交集数据可显示</p>';
            return;
        }

        // 设置容器尺寸
        container.style.width = config.width + 'px';
        container.style.height = config.height + 'px';

        // 创建SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', config.width)
            .attr('height', config.height)
            .attr('id', 'vennSVG');

        // 使用venn.js绘制
        const chart = venn.VennDiagram()
            .width(config.width - config.padding * 2)
            .height(config.height - config.padding * 2);

        const g = svg.append('g')
            .attr('transform', `translate(${config.padding}, ${config.padding})`);

        // 绘制韦恩图
        g.datum(vennData).call(chart);

        // 应用自定义样式
        this.applyStyles(g, sets, config);

        // 添加交互
        this.addInteractions(g, vennData);

        this.chart = chart;
    },

    /**
     * 应用自定义样式
     * @param {d3.Selection} g - SVG组元素
     * @param {Object[]} sets - 集合数据
     * @param {Object} config - 配置选项
     */
    applyStyles(g, sets, config) {
        // 创建颜色映射
        const colorMap = {};
        sets.forEach(set => {
            colorMap[set.name] = set.color;
        });

        // 设置圆形颜色和透明度
        g.selectAll('path')
            .style('fill-opacity', 0.4)
            .style('stroke-width', 2)
            .style('stroke-opacity', 0.8)
            .each(function(d) {
                const color = d.sets.length === 1 ? colorMap[d.sets[0]] : '#999';
                d3.select(this)
                    .style('fill', color)
                    .style('stroke', color ? d3.color(color).darker(0.5) : '#666');
            });

        // 设置标签样式
        if (config.showLabels) {
            g.selectAll('text.label')
                .style('font-size', config.fontSize + 'px')
                .style('font-weight', '600')
                .style('fill', '#2d3748')
                .style('text-anchor', 'middle')
                .style('pointer-events', 'none');
        } else {
            g.selectAll('text.label').remove();
        }

        // 设置数量标签
        if (config.showCounts) {
            g.selectAll('text.count')
                .style('font-size', (config.fontSize - 2) + 'px')
                .style('fill', '#4a5568')
                .style('text-anchor', 'middle')
                .style('pointer-events', 'none');
        } else {
            g.selectAll('text.count').remove();
        }
    },

    /**
     * 添加交互效果
     * @param {d3.Selection} g - SVG组元素
     * @param {Object[]} vennData - 韦恩图数据
     */
    addInteractions(g, vennData) {
        // 创建工具提示
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'venn-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(45, 55, 72, 0.95)')
            .style('color', 'white')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('font-size', '13px')
            .style('max-width', '300px')
            .style('max-height', '200px')
            .style('overflow-y', 'auto')
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');

        // 添加悬停效果
        g.selectAll('path')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.6)
                    .style('stroke-width', 3);

                const genes = d.genes || [];
                const genesList = genes.length > 10
                    ? genes.slice(0, 10).join(', ') + `<br>... 等 ${genes.length} 个基因`
                    : genes.join(', ');

                tooltip
                    .style('visibility', 'visible')
                    .html(`
                        <strong>${d.sets.join(' ∩ ')}</strong><br>
                        <span style="font-size: 11px;">基因数量: ${d.size}</span><br>
                        <span style="font-size: 11px; word-break: break-all;">${genesList}</span>
                    `);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.4)
                    .style('stroke-width', 2);

                tooltip.style('visibility', 'hidden');
            })
            .on('click', function(event, d) {
                // 点击复制基因列表
                if (d.genes && d.genes.length > 0) {
                    const text = d.genes.join('\n');
                    navigator.clipboard.writeText(text).then(() => {
                        alert(`已复制 ${d.sets.join(' ∩ ')} 的 ${d.genes.length} 个基因到剪贴板`);
                    }).catch(() => {
                        // 备用方案
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        alert(`已复制 ${d.sets.join(' ∩ ')} 的 ${d.genes.length} 个基因到剪贴板`);
                    });
                }
            });
    },

    /**
     * 更新图表尺寸
     * @param {number} width - 新宽度
     * @param {number} height - 新高度
     */
    updateSize(width, height) {
        const svg = d3.select('#vennSVG');
        if (!svg.empty()) {
            svg.attr('width', width).attr('height', height);
        }
    },

    /**
     * 获取SVG内容
     * @returns {string} - SVG HTML字符串
     */
    getSVGContent() {
        const svg = document.getElementById('vennSVG');
        if (!svg) return null;

        // 克隆SVG并添加样式
        const clone = svg.cloneNode(true);

        // 添加内联样式
        const style = document.createElement('style');
        style.textContent = `
            text {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
        `;
        clone.insertBefore(style, clone.firstChild);

        // 添加XML声明
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);

        return '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    },

    /**
     * 导出为PNG
     * @param {Function} callback - 回调函数，接收base64数据
     */
    exportToPNG(callback) {
        const svg = document.getElementById('vennSVG');
        if (!svg) {
            callback(null);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');

        canvas.width = width * 2; // 2倍分辨率
        canvas.height = height * 2;
        ctx.scale(2, 2);

        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);

            callback(canvas.toDataURL('image/png'));
        };

        img.src = url;
    }
};
