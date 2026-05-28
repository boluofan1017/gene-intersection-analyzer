# Gene Intersection & Union Analyzer

基因交集与并集分析工具 - 支持2-4个基因集合的交集/并集分析与韦恩图可视化

## 功能特性

- **多集合支持**: 支持2-4个基因集合的交集和并集分析
- **多种输入方式**: 支持文本框输入和文件上传（CSV/TXT格式）
- **韦恩图可视化**: 自动生成美观的韦恩图
- **自定义设置**: 支持自定义颜色、字体大小、图表尺寸等
- **结果导出**: 支持下载SVG/PNG图表和CSV数据
- **纯前端实现**: 所有计算在浏览器完成，无需服务器

## 使用方法

### 本地使用

1. 直接在浏览器中打开 `index.html` 文件
2. 在输入框中粘贴基因列表（每行一个基因，或用逗号分隔）
3. 或者点击"上传文件"按钮上传CSV/TXT文件
4. 点击"开始分析"按钮
5. 查看韦恩图和交集结果
6. 使用导出按钮下载图表或数据

### 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 将项目文件上传到仓库
3. 在仓库设置中启用 GitHub Pages
4. 选择主分支作为源
5. 访问 `https://yourusername.github.io/your-repo-name/`

## 文件结构

```
gene-intersection-analyzer/
├── index.html          # 主页面（交集+并集分析）
├── union.html          # 并集分析专用页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── analyzer.js     # 交集/并集分析算法
│   ├── venn.js         # 韦恩图绘制
│   └── export.js       # 导出功能
└── README.md           # 说明文档
```

## 技术栈

- HTML5 + CSS3 + JavaScript
- D3.js v7 (数据可视化)
- venn.js (韦恩图绘制)

## 示例数据

可以使用以下示例数据测试：

**Set A:**
```
GENE1
GENE2
GENE3
GENE4
GENE5
```

**Set B:**
```
GENE3
GENE4
GENE5
GENE6
GENE7
```

**Set C:**
```
GENE5
GENE6
GENE7
GENE8
GENE9
```

## 许可证

MIT License
