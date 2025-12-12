#!/usr/bin/env node
/**
 * 清理测试代码脚本
 * 
 * 此脚本会删除所有标记为测试的代码和文件：
 * 1. 删除标记为 TEST_FILE 的文件
 * 2. 删除代码中 TEST_CODE_START 到 TEST_CODE_END 之间的内容
 * 3. 删除代码中 TEST_SECTION_START 到 TEST_SECTION_END 之间的内容
 */

const fs = require('fs')
const path = require('path')

const filesToDelete = [
  'server/api/res.get.ts',
  'server/api/res2.get.ts',
  'server/api/files/download-and-save.post.ts'
]

const filesToClean = [
  'pages/main/document-analysis.vue'
]

console.log('🧹 开始清理测试代码...\n')

// 删除测试文件
console.log('📁 删除测试文件:')
filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`  ✓ 已删除: ${file}`)
    } else {
      console.log(`  ⊘ 文件不存在: ${file}`)
    }
  } catch (error) {
    console.error(`  ✗ 删除失败: ${file}`, error.message)
  }
})

console.log('\n📝 清理代码文件:')

// 清理代码文件中的测试代码
filesToClean.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⊘ 文件不存在: ${file}`)
      return
    }
    
    let content = fs.readFileSync(filePath, 'utf-8')
    let modified = false
    
    // 删除 TEST_SECTION_START 到 TEST_SECTION_END 之间的内容（包括标记行）
    const sectionRegex = /[ \t]*<!-- TEST_SECTION_START:.*?-->[\s\S]*?<!-- TEST_SECTION_END -->\n*/g
    if (sectionRegex.test(content)) {
      content = content.replace(sectionRegex, '')
      modified = true
      console.log(`  ✓ 已删除 TEST_SECTION: ${file}`)
    }
    
    // 删除 TEST_CODE_START 到 TEST_CODE_END 之间的内容（包括标记行）
    const codeRegex = /[ \t]*\/\/ TEST_CODE_START:.*?\n[\s\S]*?[ \t]*\/\/ TEST_CODE_END\n*/g
    if (codeRegex.test(content)) {
      content = content.replace(codeRegex, '')
      modified = true
      console.log(`  ✓ 已删除 TEST_CODE: ${file}`)
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8')
      console.log(`  ✓ 已更新: ${file}`)
    } else {
      console.log(`  ⊘ 无需修改: ${file}`)
    }
  } catch (error) {
    console.error(`  ✗ 处理失败: ${file}`, error.message)
  }
})

console.log('\n✨ 清理完成！')
console.log('\n提示: 请检查修改后的文件，确保代码正常运行。')
