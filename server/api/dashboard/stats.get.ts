export default defineEventHandler(async (event) => {
  // 模拟统计数据 - 在实际应用中这些数据应该从数据库获取
  const stats = {
    totalFiles: 128,
    completedFiles: 83, 
    pendingFiles: 45,
    urgentFiles: 12,
    categories: {
      '验收记录': 42,
      '检测报告': 38,
      '检验记录': 28,
      '其他资料': 20
    },
    recentFiles: [
      {
        id: 1,
        name: '地基验收记录',
        type: '验收记录',
        date: '2025-11-12',
        status: '已完成'
      },
      {
        id: 2,
        name: '混凝土抗压强度报告',
        type: '检测报告', 
        date: '2025-11-11',
        status: '待审核'
      },
      {
        id: 3,
        name: '钢筋进场检验记录',
        type: '检验记录',
        date: '2025-11-10',
        status: '紧急'
      },
      {
        id: 4,
        name: '模板安装验收记录',
        type: '验收记录',
        date: '2025-11-09',
        status: '已完成'
      }
    ],
    inspectionStats: {
      totalInspections: 6,
      passedInspections: 2,
      failedInspections: 1,
      pendingInspections: 2,
      specialInspections: 1,
      overallProgress: 83
    }
  }

  return {
    success: true,
    data: stats
  }
})
