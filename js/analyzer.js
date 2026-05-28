/**
 * 基因交集分析模块
 * 负责解析基因列表并计算交集
 */

const GeneAnalyzer = {
    /**
     * 解析基因列表文本
     * @param {string} text - 输入文本
     * @returns {string[]} - 基因数组
     */
    parseGeneList(text) {
        if (!text || text.trim() === '') return [];

        // 按行分割，然后处理逗号分隔的情况
        const lines = text.split(/[\n\r]+/);
        const genes = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed === '') return;

            // 检查是否包含逗号
            if (trimmed.includes(',')) {
                trimmed.split(',').forEach(gene => {
                    const g = gene.trim();
                    if (g !== '') genes.push(g);
                });
            } else if (trimmed.includes('\t')) {
                // 支持Tab分隔
                trimmed.split('\t').forEach(gene => {
                    const g = gene.trim();
                    if (g !== '') genes.push(g);
                });
            } else {
                genes.push(trimmed);
            }
        });

        // 去重并排序
        return [...new Set(genes)].sort();
    },

    /**
     * 计算两个集合的交集
     * @param {string[]} setA
     * @param {string[]} setB
     * @returns {string[]}
     */
    intersect(setA, setB) {
        const setBSet = new Set(setB);
        return setA.filter(gene => setBSet.has(gene)).sort();
    },

    /**
     * 计算两个集合的并集
     * @param {string[]} setA
     * @param {string[]} setB
     * @returns {string[]}
     */
    union(setA, setB) {
        return [...new Set([...setA, ...setB])].sort();
    },

    /**
     * 计算两个集合的差集 (A - B)
     * @param {string[]} setA
     * @param {string[]} setB
     * @returns {string[]}
     */
    difference(setA, setB) {
        const setBSet = new Set(setB);
        return setA.filter(gene => !setBSet.has(gene)).sort();
    },

    /**
     * 计算所有可能的交集组合
     * @param {Object[]} sets - 集合数组 [{name, genes}]
     * @returns {Object[]} - 交集结果数组
     */
    calculateAllIntersections(sets) {
        const results = [];
        const n = sets.length;

        // 生成所有可能的组合 (使用位掩码)
        const totalCombinations = Math.pow(2, n);

        for (let mask = 1; mask < totalCombinations; mask++) {
            const includedSets = [];
            const includedIndices = [];

            for (let i = 0; i < n; i++) {
                if (mask & (1 << i)) {
                    includedSets.push(sets[i]);
                    includedIndices.push(i);
                }
            }

            // 计算这些集合的交集
            let intersection = [...includedSets[0].genes];
            for (let i = 1; i < includedSets.length; i++) {
                intersection = this.intersect(intersection, includedSets[i].genes);
            }

            // 只保留有基因的交集
            if (intersection.length > 0) {
                const setNames = includedSets.map(s => s.name);
                const label = setNames.join(' ∩ ');

                results.push({
                    id: mask,
                    indices: includedIndices,
                    names: setNames,
                    label: label,
                    genes: intersection,
                    count: intersection.length
                });
            }
        }

        // 按交集大小排序（大的在前）
        results.sort((a, b) => b.count - a.count);

        return results;
    },

    /**
     * 计算仅属于特定集合的基因（独有基因）
     * @param {Object[]} sets - 集合数组
     * @returns {Object[]} - 独有基因结果
     */
    calculateExclusiveGenes(sets) {
        const results = [];

        sets.forEach((set, index) => {
            // 获取其他所有集合的并集
            const otherSets = sets.filter((_, i) => i !== index);
            let otherUnion = [];
            otherSets.forEach(other => {
                otherUnion = this.union(otherUnion, other.genes);
            });

            // 计算独有基因
            const exclusive = this.difference(set.genes, otherUnion);

            results.push({
                setIndex: index,
                setName: set.name,
                genes: exclusive,
                count: exclusive.length
            });
        });

        return results;
    },

    /**
     * 生成韦恩图数据
     * @param {Object[]} sets - 集合数组
     * @returns {Object[]} - venn.js 格式的数据
     */
    generateVennData(sets) {
        const vennData = [];

        if (sets.length === 2) {
            // 两个集合的情况
            const [setA, setB] = sets;
            const intersection = this.intersect(setA.genes, setB.genes);
            const onlyA = this.difference(setA.genes, setB.genes);
            const onlyB = this.difference(setB.genes, setA.genes);

            vennData.push({ sets: [setA.name], size: setA.genes.length, genes: onlyA });
            vennData.push({ sets: [setB.name], size: setB.genes.length, genes: onlyB });
            vennData.push({ sets: [setA.name, setB.name], size: intersection.length, genes: intersection });

        } else if (sets.length === 3) {
            // 三个集合的情况
            const [setA, setB, setC] = sets;

            // 生成所有组合
            const combinations = [
                { sets: [setA.name], indices: [0] },
                { sets: [setB.name], indices: [1] },
                { sets: [setC.name], indices: [2] },
                { sets: [setA.name, setB.name], indices: [0, 1] },
                { sets: [setA.name, setC.name], indices: [0, 2] },
                { sets: [setB.name, setC.name], indices: [1, 2] },
                { sets: [setA.name, setB.name, setC.name], indices: [0, 1, 2] }
            ];

            combinations.forEach(combo => {
                let intersection = [...sets[combo.indices[0]].genes];
                for (let i = 1; i < combo.indices.length; i++) {
                    intersection = this.intersect(intersection, sets[combo.indices[i]].genes);
                }

                if (intersection.length > 0) {
                    vennData.push({
                        sets: combo.sets,
                        size: intersection.length,
                        genes: intersection
                    });
                }
            });

        } else if (sets.length === 4) {
            // 四个集合的情况
            const [setA, setB, setC, setD] = sets;

            // 生成所有组合
            const combinations = [
                { sets: [setA.name], indices: [0] },
                { sets: [setB.name], indices: [1] },
                { sets: [setC.name], indices: [2] },
                { sets: [setD.name], indices: [3] },
                { sets: [setA.name, setB.name], indices: [0, 1] },
                { sets: [setA.name, setC.name], indices: [0, 2] },
                { sets: [setA.name, setD.name], indices: [0, 3] },
                { sets: [setB.name, setC.name], indices: [1, 2] },
                { sets: [setB.name, setD.name], indices: [1, 3] },
                { sets: [setC.name, setD.name], indices: [2, 3] },
                { sets: [setA.name, setB.name, setC.name], indices: [0, 1, 2] },
                { sets: [setA.name, setB.name, setD.name], indices: [0, 1, 3] },
                { sets: [setA.name, setC.name, setD.name], indices: [0, 2, 3] },
                { sets: [setB.name, setC.name, setD.name], indices: [1, 2, 3] },
                { sets: [setA.name, setB.name, setC.name, setD.name], indices: [0, 1, 2, 3] }
            ];

            combinations.forEach(combo => {
                let intersection = [...sets[combo.indices[0]].genes];
                for (let i = 1; i < combo.indices.length; i++) {
                    intersection = this.intersect(intersection, sets[combo.indices[i]].genes);
                }

                if (intersection.length > 0) {
                    vennData.push({
                        sets: combo.sets,
                        size: intersection.length,
                        genes: intersection
                    });
                }
            });
        }

        return vennData;
    },

    /**
     * 生成统计摘要
     * @param {Object[]} sets - 集合数组
     * @param {Object[]} intersections - 交集结果
     * @returns {Object} - 统计摘要
     */
    generateSummary(sets, intersections) {
        // 计算总并集
        let totalUnion = [];
        sets.forEach(set => {
            totalUnion = this.union(totalUnion, set.genes);
        });

        // 计算全交集
        let allIntersection = sets.length > 0 ? [...sets[0].genes] : [];
        for (let i = 1; i < sets.length; i++) {
            allIntersection = this.intersect(allIntersection, sets[i].genes);
        }

        return {
            totalSets: sets.length,
            totalUniqueGenes: totalUnion.length,
            totalIntersections: intersections.length,
            allSetsIntersection: allIntersection.length,
            setStats: sets.map(set => ({
                name: set.name,
                geneCount: set.genes.length
            }))
        };
    }
};
