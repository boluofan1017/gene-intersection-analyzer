/**
 * 主应用模块
 * 整合所有功能，处理用户交互
 */

const app = {
    // 当前显示的集合数量
    currentSets: 2,

    // 最大集合数量
    maxSets: 4,

    // 最近一次分析结果
    lastResults: null,

    /**
     * 初始化应用
     */
    init() {
        this.bindSettingsEvents();
        this.updateSetVisibility();
        this.loadTestData();
    },

    /**
     * 绑定设置面板事件
     */
    bindSettingsEvents() {
        // 字体大小滑块
        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');

        fontSizeSlider.addEventListener('input', function() {
            fontSizeValue.textContent = this.value + 'px';
        });

        // 图表宽度滑块
        const chartWidthSlider = document.getElementById('chartWidth');
        const chartWidthValue = document.getElementById('chartWidthValue');

        chartWidthSlider.addEventListener('input', function() {
            chartWidthValue.textContent = this.value + 'px';
        });

        // 图表高度滑块
        const chartHeightSlider = document.getElementById('chartHeight');
        const chartHeightValue = document.getElementById('chartHeightValue');

        chartHeightSlider.addEventListener('input', function() {
            chartHeightValue.textContent = this.value + 'px';
        });
    },

    /**
     * 处理文件上传
     * @param {HTMLInputElement} input - 文件输入元素
     * @param {number} index - 集合索引
     */
    handleFileUpload(input, index) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const textarea = document.querySelectorAll('.gene-list')[index];
            if (textarea) {
                textarea.value = content;
            }
        };
        reader.readAsText(file);
    },

    /**
     * 添加集合
     */
    addSet() {
        if (this.currentSets >= this.maxSets) {
            alert('最多支持4个集合');
            return;
        }

        this.currentSets++;
        this.updateSetVisibility();
    },

    /**
     * 切换集合显示/隐藏
     * @param {number} index - 集合索引
     */
    toggleSet(index) {
        const setElement = document.querySelectorAll('.set-input')[index];
        if (setElement) {
            setElement.classList.toggle('hidden');

            // 更新当前集合数量
            this.currentSets = document.querySelectorAll('.set-input:not(.hidden)').length;
            this.updateAddButton();
        }
    },

    /**
     * 更新集合显示状态
     */
    updateSetVisibility() {
        const sets = document.querySelectorAll('.set-input');

        sets.forEach((set, index) => {
            if (index < 2) {
                // 前两个集合始终显示
                set.classList.remove('hidden');
            } else if (index < this.currentSets) {
                // 根据当前数量显示
                set.classList.remove('hidden');
            } else {
                set.classList.add('hidden');
            }
        });

        this.updateAddButton();
    },

    /**
     * 更新添加按钮状态
     */
    updateAddButton() {
        const addBtn = document.getElementById('addSetBtn');
        if (this.currentSets >= this.maxSets) {
            addBtn.disabled = true;
            addBtn.textContent = '已达到最大数量';
        } else {
            addBtn.disabled = false;
            addBtn.textContent = '+ 添加集合';
        }
    },

    /**
     * 收集输入数据
     * @returns {Object[]} - 集合数据数组
     */
    collectInputData() {
        const sets = [];
        const setElements = document.querySelectorAll('.set-input:not(.hidden)');

        setElements.forEach((element, index) => {
            const name = element.querySelector('.set-name').value.trim() || `Set ${index + 1}`;
            const color = element.querySelector('.set-color').value;
            const genesText = element.querySelector('.gene-list').value;
            const genes = GeneAnalyzer.parseGeneList(genesText);

            if (genes.length > 0) {
                sets.push({
                    name: name,
                    color: color,
                    genes: genes
                });
            }
        });

        return sets;
    },

    /**
     * 执行分析
     */
    analyze() {
        // 收集输入数据
        const sets = this.collectInputData();

        if (sets.length < 2) {
            alert('请至少输入两个包含基因的集合');
            return;
        }

        // 计算所有交集
        const intersections = GeneAnalyzer.calculateAllIntersections(sets);

        // 生成统计摘要
        const summary = GeneAnalyzer.generateSummary(sets, intersections);

        // 保存结果
        this.lastResults = {
            sets: sets,
            intersections: intersections,
            summary: summary
        };

        // 获取图表设置
        const options = this.getChartOptions();

        // 渲染韦恩图
        VennRenderer.render('vennDiagram', sets, options);

        // 显示交集结果，隐藏并集结果
        document.getElementById('intersectionContainer').style.display = 'block';
        document.getElementById('unionContainer').style.display = 'none';

        // 显示结果表格
        this.renderIntersectionTable(intersections);

        // 显示结果区域
        document.getElementById('resultsSection').style.display = 'block';

        // 滚动到结果区域
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * 执行并集分析
     */
    analyzeUnion() {
        // 收集输入数据
        const sets = this.collectInputData();

        if (sets.length < 2) {
            alert('请至少输入两个包含基因的集合');
            return;
        }

        // 计算并集
        const unionResult = GeneAnalyzer.calculateUnion(sets);

        // 保存结果
        this.lastResults = {
            sets: sets,
            union: unionResult,
            isUnion: true
        };

        // 获取图表设置
        const options = this.getChartOptions();

        // 渲染韦恩图
        VennRenderer.render('vennDiagram', sets, options);

        // 隐藏交集结果，显示并集结果
        document.getElementById('intersectionContainer').style.display = 'none';
        document.getElementById('unionContainer').style.display = 'block';

        // 显示并集结果表格
        this.renderUnionTable(unionResult);

        // 显示结果区域
        document.getElementById('resultsSection').style.display = 'block';

        // 滚动到结果区域
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * 获取图表配置选项
     * @returns {Object} - 配置选项
     */
    getChartOptions() {
        return {
            width: parseInt(document.getElementById('chartWidth').value),
            height: parseInt(document.getElementById('chartHeight').value),
            fontSize: parseInt(document.getElementById('fontSize').value),
            showLabels: document.getElementById('showLabels').checked,
            showCounts: document.getElementById('showCounts').checked
        };
    },

    /**
     * 渲染交集结果表格
     * @param {Object[]} intersections - 交集结果数组
     */
    renderIntersectionTable(intersections) {
        const tbody = document.getElementById('intersectionBody');
        tbody.innerHTML = '';

        intersections.forEach((intersection, index) => {
            const tr = document.createElement('tr');

            // 交集名称列
            const tdName = document.createElement('td');
            tdName.innerHTML = `<strong>${intersection.label}</strong>`;
            tr.appendChild(tdName);

            // 基因数量列
            const tdCount = document.createElement('td');
            tdCount.textContent = intersection.count;
            tr.appendChild(tdCount);

            // 基因列表列
            const tdGenes = document.createElement('td');
            const genesDiv = document.createElement('div');
            genesDiv.className = 'gene-tags';

            const displayGenes = intersection.genes.length > 20
                ? intersection.genes.slice(0, 20)
                : intersection.genes;

            displayGenes.forEach(gene => {
                const span = document.createElement('span');
                span.className = 'gene-tag';
                span.textContent = gene;
                genesDiv.appendChild(span);
            });

            if (intersection.genes.length > 20) {
                const moreSpan = document.createElement('span');
                moreSpan.className = 'gene-tag';
                moreSpan.textContent = `... +${intersection.genes.length - 20}`;
                moreSpan.style.fontStyle = 'italic';
                genesDiv.appendChild(moreSpan);
            }

            tdGenes.appendChild(genesDiv);
            tr.appendChild(tdGenes);

            // 操作列
            const tdAction = document.createElement('td');
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.onclick = function() {
                exporter.copyIntersection(intersection.genes, intersection.label);
            };
            tdAction.appendChild(copyBtn);
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
        });
    },

    /**
     * 渲染并集结果表格
     * @param {Object} unionResult - 并集结果
     */
    renderUnionTable(unionResult) {
        // 更新摘要信息
        document.getElementById('unionTotalCount').textContent = unionResult.totalCount;
        document.getElementById('unionSetCount').textContent = unionResult.setCount;

        // 渲染表格
        const tbody = document.getElementById('unionBody');
        tbody.innerHTML = '';

        unionResult.contributions.forEach((contribution, index) => {
            const tr = document.createElement('tr');

            // 集合名称列
            const tdName = document.createElement('td');
            tdName.innerHTML = `<strong>${contribution.setName}</strong>`;
            tr.appendChild(tdName);

            // 基因数量列
            const tdCount = document.createElement('td');
            tdCount.innerHTML = `总数: ${contribution.totalGenes}<br>独有: ${contribution.exclusiveCount}<br>共有: ${contribution.sharedCount}`;
            tr.appendChild(tdCount);

            // 独有基因列
            const tdGenes = document.createElement('td');
            const genesDiv = document.createElement('div');
            genesDiv.className = 'gene-tags';

            const displayGenes = contribution.exclusiveGenes.length > 15
                ? contribution.exclusiveGenes.slice(0, 15)
                : contribution.exclusiveGenes;

            displayGenes.forEach(gene => {
                const span = document.createElement('span');
                span.className = 'gene-tag';
                span.textContent = gene;
                genesDiv.appendChild(span);
            });

            if (contribution.exclusiveGenes.length > 15) {
                const moreSpan = document.createElement('span');
                moreSpan.className = 'gene-tag';
                moreSpan.textContent = `... +${contribution.exclusiveGenes.length - 15}`;
                moreSpan.style.fontStyle = 'italic';
                genesDiv.appendChild(moreSpan);
            }

            tdGenes.appendChild(genesDiv);
            tr.appendChild(tdGenes);

            // 操作列
            const tdAction = document.createElement('td');
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '复制独有基因';
            copyBtn.onclick = function() {
                exporter.copyIntersection(contribution.exclusiveGenes, `${contribution.setName} 独有基因`);
            };
            tdAction.appendChild(copyBtn);
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
        });

        // 渲染完整并集基因列表
        const unionGenesList = document.getElementById('unionGenesList');
        unionGenesList.innerHTML = '';

        unionResult.totalUnion.forEach(gene => {
            const span = document.createElement('span');
            span.className = 'gene-tag';
            span.textContent = gene;
            unionGenesList.appendChild(span);
        });
    },

    /**
     * 从localStorage加载测试数据
     */
    loadTestData() {
        const testDataStr = localStorage.getItem('geneTestData');
        if (!testDataStr) return;

        try {
            const testData = JSON.parse(testDataStr);
            if (testData.sets && testData.sets.length > 0) {
                // 更新当前集合数量
                this.currentSets = Math.min(testData.sets.length, this.maxSets);
                this.updateSetVisibility();

                // 填充数据
                const setElements = document.querySelectorAll('.set-input');
                testData.sets.forEach((setData, index) => {
                    if (index < this.maxSets) {
                        const nameInput = setElements[index].querySelector('.set-name');
                        const colorInput = setElements[index].querySelector('.set-color');
                        const textarea = setElements[index].querySelector('.gene-list');

                        if (nameInput) nameInput.value = setData.name || `Set ${index + 1}`;
                        if (colorInput) colorInput.value = setData.color || '#FF6B6B';
                        if (textarea) textarea.value = setData.genes || '';
                    }
                });

                // 清除localStorage中的数据
                localStorage.removeItem('geneTestData');
            }
        } catch (e) {
            console.error('Failed to load test data:', e);
        }
    },

    /**
     * 清空所有输入
     */
    clearAll() {
        if (!confirm('确定要清空所有输入吗？')) return;

        // 清空文本框
        document.querySelectorAll('.gene-list').forEach(textarea => {
            textarea.value = '';
        });

        // 重置集合名称
        const defaultNames = ['Set A', 'Set B', 'Set C', 'Set D'];
        document.querySelectorAll('.set-name').forEach((input, index) => {
            input.value = defaultNames[index];
        });

        // 重置颜色
        const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        document.querySelectorAll('.set-color').forEach((input, index) => {
            input.value = defaultColors[index];
        });

        // 隐藏结果区域
        document.getElementById('resultsSection').style.display = 'none';

        // 清空韦恩图
        document.getElementById('vennDiagram').innerHTML = '';

        // 清空表格
        document.getElementById('intersectionBody').innerHTML = '';

        // 清空结果
        this.lastResults = null;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});
