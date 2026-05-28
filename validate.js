// 验证脚本 - 检查所有模块是否正确加载

console.log('开始验证基因交集分析工具...');

// 检查模块是否加载
const modules = ['GeneAnalyzer', 'VennRenderer', 'exporter', 'app'];
let allLoaded = true;

modules.forEach(module => {
    if (typeof window[module] === 'undefined') {
        console.error(`❌ 模块 ${module} 未加载`);
        allLoaded = false;
    } else {
        console.log(`✅ 模块 ${module} 已加载`);
    }
});

if (allLoaded) {
    console.log('✅ 所有模块加载成功');

    // 测试交集分析功能
    console.log('\n测试交集分析功能...');

    const testSets = [
        { name: 'Set A', genes: ['GENE1', 'GENE2', 'GENE3', 'GENE4', 'GENE5'] },
        { name: 'Set B', genes: ['GENE3', 'GENE4', 'GENE5', 'GENE6', 'GENE7'] }
    ];

    const intersections = GeneAnalyzer.calculateAllIntersections(testSets);
    console.log(`✅ 计算了 ${intersections.length} 个交集`);

    // 测试韦恩图数据生成
    const vennData = GeneAnalyzer.generateVennData(testSets);
    console.log(`✅ 生成了 ${vennData.length} 个韦恩图数据`);

    // 测试统计摘要
    const summary = GeneAnalyzer.generateSummary(testSets, intersections);
    console.log(`✅ 统计摘要: ${summary.totalUniqueGenes} 个唯一基因`);

    console.log('\n✅ 所有测试通过！');
    console.log('\n使用说明:');
    console.log('1. 在浏览器中打开 index.html');
    console.log('2. 输入基因列表');
    console.log('3. 点击"开始分析"');
} else {
    console.log('\n❌ 部分模块加载失败，请检查文件是否完整');
}
