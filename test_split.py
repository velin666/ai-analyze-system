#!/usr/bin/env python3
"""
测试DOCX拆分功能
"""
import os
import sys
import subprocess

def test_split():
    # 测试文档路径
    test_doc = r"d:\self\ai-analyze-system\test-docx\三航横沙新洲工程(1).docx"
    
    if not os.path.exists(test_doc):
        print(f"测试文档不存在: {test_doc}")
        return False
    
    # 输出目录
    output_dir = r"d:\self\ai-analyze-system\test-output"
    
    # Python脚本路径
    script_path = r"d:\self\ai-analyze-system\server\api\files\split_docx_pages.py"
    
    # 构建命令
    cmd = [
        "python", 
        script_path, 
        test_doc, 
        output_dir, 
        "5"  # 每个文件5页，便于测试
    ]
    
    print(f"执行命令: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5分钟超时
            cwd=os.path.dirname(script_path)
        )
        
        print("STDOUT:")
        print(result.stdout)
        
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        
        print(f"返回码: {result.returncode}")
        
        # 检查输出目录
        if os.path.exists(output_dir):
            files = os.listdir(output_dir)
            docx_files = [f for f in files if f.endswith('.docx')]
            print(f"\n生成的DOCX文件数量: {len(docx_files)}")
            for f in docx_files:
                file_path = os.path.join(output_dir, f)
                size = os.path.getsize(file_path)
                print(f"  {f} - {size} bytes")
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("执行超时")
        return False
    except Exception as e:
        print(f"执行错误: {e}")
        return False

if __name__ == "__main__":
    success = test_split()
    if success:
        print("\n✅ 测试成功")
    else:
        print("\n❌ 测试失败")
