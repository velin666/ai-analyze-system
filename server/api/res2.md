### 错误清单

| 错误类型 | 具体位置 | 错误描述 | 修正建议 |
|----------|----------|----------|----------|
| 错字 | 序号12 | 型号中“O.75KW”的“O”应为数字“0” | 修正为“0.75KW” |
| 逻辑错误 | 序号27 | 数量26只，备注KA1-7、9-11、16-18、23-30（共21只） | 修正数量为21或补充备注至36只 |
| 逻辑错误 | 序号28 | 数量10只，备注KA8、12-15、19-22（共9只） | 修正数量为9或补充备注至10只 |
| 格式错误 | 序号82 | 描述“20×0.5mm2（4芯）”矛盾 | 删除“（4芯）”或修正为“20芯” |
| 格式错误 | 序号85 | “0 .5”中间空格 | 修正为“0.5” |
| 逻辑错误 | 序号114 | 重复条目“2M5×35” | 修正为“201不锈钢六角头螺栓M5×35” |
| 格式错误 | 序号111-140 | 机械螺丝条目ERP识别码缺失 | 补充ERP识别码（如“WGJ-DQ-JX-XXX”） |
| 格式错误 | 序号147-163 | 全空行冗余内容 | 删除空行 |
| 格式错误 | 序号49 | 重复条目“触点基座ZB2BZ101C” | 删除重复行或修正型号 |

### 修正后文档（表格形式）

| 序号 | ERP识别码 | 品牌 | 名称 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|-----------|------|------|----------|------|------|------|
| 1 | WGJ-DQ-CPCZ-0000 | SIEMENS | HMI 面板 | 型号:SMART 1000 IE V4 订货号:6AV6 648-0DE11-3AX0 | 1 | 台 | CMP |
| 2 | WGJ-DQ-CPCZ-0010 | SIEMENS | SMART 标准型CPU模块 | 型号:CPU ST60 订货号:6ES7 288-1ST60-0AA1 | 1 | 台 | PLC |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 12 | WGJ-DQ-CPCZ-0020 | SIEMENS | SMART 模拟量输入模块 | 型号:EM AE04 4输入 订货号:6ES7 288-3AE04-0AA0 | 1 | 件 | AE04 |
| 27 | WGJ-DQ-CPCZ-0070 | BRAHMA | 燃烧控制器 | 型号:SM592N/S 230VAC | 4 | 只 | CO1-4 |
| 28 | WGJ-DQ-CPCZ-0070 | BRAHMA | 燃烧控制器 | 型号:SM592N/S 230VAC | 4 | 只 | CO1-4 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 82 | WGJ-DQ-CPPJ-0050 | PEOPLE | 多功能插座 | AC30-W 250V/15A | 1 | 只 | 23X |
| 111 | WGJ-DQ-JX-0001 | 201不锈钢 | 六角头螺栓 | M5×35 | 2 | 只 | - |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 147-163 | - | - | - | - | - | - | - |

（注：完整修正后的表格需保留所有有效条目，删除冗余空行及重复内容）

```markdown
| 序号 | ERP识别码 | 品牌 | 名称 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|-----------|------|------|----------|------|------|------|
| 1 | WGJ-DQ-CPCZ-0000 | SIEMENS | HMI 面板 | 型号:SMART 1000 IE V4 订货号:6AV6 648-0DE11-3AX0 | 1 | 台 | CMP |
| 2 | WGJ-DQ-CPCZ-0010 | SIEMENS | SMART 标准型CPU模块 | 型号:CPU ST60 订货号:6ES7 288-1ST60-0AA1 | 1 | 台 | PLC |
| 3 | WGJ-DQ-CPCZ-0020 | SIEMENS | SMART 模拟量输入模块 | 型号:EM AE04 4输入 订货号:6ES7 288-3AE04-0AA0 | 1 | 件 | AE04 |
| 4 | WGJ-DQ-CPCZ-0050 | SIEMENS | 连接器 | 6ES7972-0BB42-0XA0 | 1 | 只 | RS485 |
| 5 | WGJ-DQ-CPCZ-0051 | SIEMENS | PROFIBUS通信电缆线 | 6XV1-830-0EH10 | 4 | 米 | - |
| 6 | WGJ-DQ-CPDX-0100 | - | 网线 | 纯铜超5类屏蔽网线 8芯 | 25 | 米 | - |
| 7 | WGJ-DQ-CPDX-0101 | - | 网线水晶头 | 8芯超五类屏蔽 | 6 | 只 | - |
| 8 | WGJ-DQ-CPCZ-0210 | - | 交换机 | 工业五口百兆交换机 | 1 | 只 | - |
| 9 | WGJ-DQ-CPCZ-0200 | 捷创 | PLC远程网关 | JC00-DE 4G Wifi | 1 | 台 | - |
| 10 | WGJ-DQ-CPCZ-0107 | VLT 丹佛斯 | 变频器 | iC2-30FA3N04-12A0E20F4+ACBC 380V 5.5KW | 1 | 台 | B5 |
| 11 | WGJ-DQ-CPCZ-0104 | VLT 丹佛斯 | 变频器 | IC2-30FA3N04-05A3E20F4+ACBC 380V 2.2KW | 2 | 台 | B1-2 |
| 12 | WGJ-DQ-CPCZ-0102 | VLT 丹佛斯 | 变频器 | IC2-30FA3N04-02A2E20F4+ACBC 380V 0.75KW | 2 | 台 | B3-4 |
| 13 | WGJ-DQ-CPCZ-0070 | BRAHMA | 燃烧控制器 | SM592N/S 230VAC | 4 | 只 | CO1-4 |
| 14 | WGJ-DQ-CPDY-0300 | Schneider 施耐德 | 工业开关电源 | ABL2REM24085K 24V 8.3A | 1 | 件 | WM |
| 15 | WGJ-DQ-CPDY-0260 | Raytek 雷泰 | 红外测温器 | RAYCI3A 12-24VDC | 1 | 件 | HG |
| 16 | WGJ-DQ-CPDY-0250 | STATELY 奥普士 | 接近开关 | SD-1805F1 PNP NO 10-30VDC | 2 | 只 | JK1 |
| 17 | WGJ-DQ-CPDY-0033 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C32 | 2 | 只 | QF1 |
| 18 | WGJ-DQ-CPDY-0030 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C16 | 3 | 只 | QF2-5 |
| 19 | WGJ-DQ-CPDY-0029 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C10 | 1 | 只 | QF6 |
| 20 | WGJ-DQ-CPDY-0005 | Schneider 施耐德 | 小型断路器 | OSMC32 N1C6 | 1 | 只 | QF8 |
| 21 | WGJ-DQ-CPDY-0111 | Schneider 施耐德 | 交流接触器 | LC1 D1810 M7C 220VAC | 3 | 只 | KM1-2,6 |
| 22 | WGJ-DQ-CPDY-0109 | Schneider 施耐德 | 交流接触器 | LC1 D0910 M7C 220VAC | 1 | 只 | KM3-5 |
| 23 | WGJ-DQ-CPDY-0137 | Schneider 施耐德 | 热过载继电器 | LRD 07C 1.6-2.5A | 1 | 只 | FR3 |
| 24 | WGJ-DQ-CPDY-0142 | Schneider 施耐德 | 热过载继电器 | LRD 16C 9-13A | 3 | 只 | FR1-2,6 |
| 25 | WGJ-DQ-CPCZ-0052 | - | 直流信号隔离器 | 4-20mA转0-10V | 1 | 只 | - |
| 26 | WGJ-DQ-CPCZ-0053 | - | 直流信号隔离器 | 0-10V转4-20mA | 1 | 只 | - |
| 27 | WGJ-DQ-CPDY-0218 | OMRON 欧姆龙 | 中间小型继电器 | MY4N-GS 24VDC 4组触点 | 21 | 只 | KA1-7,9-11,16-18,23-30 |
| 28 | WGJ-DQ-CPDY-0221 | OMRON 欧姆龙 | 中间小型继电器 | MY4N-GS 220/240VAC | 9 | 只 | KA8,12-15,19-22 |
| 29 | WGJ-DQ-CPDY-0223 | OMRON 欧姆龙 | 中间继电器底座 | PYFZ-14-E 14脚 | 36 | 只 | KA1-36 |
| 30 | WGJ-DQ-CPDY-0244 | Schneider 施耐德 | 3极负荷开关 | V3C ITH63A | 1 | 只 | AK0 |
| 31 | WGJ-DQ-CPDY-0237 | Schneider 施耐德 | 负荷开关操作手柄 | KCF2PZC (63A) | 1 | 只 | AK0 |
| 32 | WGJ-DQ-CPDY-0350 | 德力西 | 电源隔离开关 | CDF1-20 16A 3P | 8 | 只 | AK1-5 |
| 33 | WGJ-DQ-CPDY-0360 | SCHMERSAL 施迈赛 | 拉线开关 | TQ441-01/01y-UE-R-M20-1572 | 1 | 只 | SQ1 |
| 34 | WGJ-DQ-CPDY-0380 | 浙江亿纬 | 耐高温行程开关 | JDHK-2G 350℃ | 1 | 只 | SQ2 |
| 35 | WGJ-DQ-CPCZ-0080 | - | 超声波液位计 | 1米量程 DC24V 4-20mA+RS485 | 1 | 只 | - |
| 36 | WGJ-DQ-CPDY-0400 | 新三色灯 | 报警灯管式安装底座 | 680.839.55 φ70mm 24VDC | 1 | 件 | BJ,FM |
| 37 | WGJ-DQ-CPDY-0401 | - | 报警灯LED闪烁模块 | 682.139.55 φ70mm 24VDC | 1 | 件 | BJ,FM |
| 38 | WGJ-DQ-CPDY-0402 | - | 报警灯蜂鸣器模块 | 685.829.55 φ70mm 24VDC 95dB | 1 | 件 | BJ,FM |
| 39 | WGJ-DQ-CPDY-0403 | - | 直立式安装支架 | 975.849.11 | 1 | 件 | BJ,FM |
| 40 | WGJ-DQ-CPDY-0164 | Schneider 施耐德 | 指示灯 | XB2BVB3LC（绿） | 1 | 只 | HL1,8-12 |
| 41 | WGJ-DQ-CPDY-0181 | Schneider 施耐德 | 磨菇头按钮头 | ZB2BS54C（红） | 2 | 只 | SB9-10 |
| 42 | WGJ-DQ-CPDY-0198 | Schneider 施耐德 | 触点基座 | ZB2BZ102C（常闭） | 1 | 只 | SB9-10 |
| 43 | WGJ-DQ-CPDY-0249 | Schneider 施耐德 | 急停黄圈 | ZB2BY9330 | 1 | 只 | SB9-10 |
| 44 | WGJ-DQ-CPDY-0189 | Schneider 施耐德 | 平头带灯按钮头 | ZB2BW33C(绿色24V) | 1 | 只 | SB1-6(HL2-7) |
| 45 | WGJ-DQ-CPDY-0202 | Schneider 施耐德 | 带灯按钮底座 | ZB2BWB31C(绿色24V) | 1 | 只 | SB1-6(HL2-7) |
| 46 | WGJ-DQ-CPDY-0187 | Schneider 施耐德 | 平头按钮头 | ZB2BA2C(黑色) | - | - | - |
| 47 | WGJ-DQ-CPDY-0197 | Schneider 施耐德 | 触点基座 | ZB2BZ101C(常开) | 1 | 只 | SB1-6(HL2-7) |
| 48 | WGJ-DQ-CPDY-0193 | Schneider 施耐德 | 标准手柄选择开关头 | ZB2BD2C（2位） | 1 | 件 | SA1-2 |
| 49 | WGJ-DQ-CPDY-0197 | Schneider 施耐德 | 触点基座 | ZB2BZ101C（常开） | 1 | 件 | SA1-2 |
| 50 | WGJ-DQ-CPDY-0224 | HRUO 上海沪工 | 熔断器 | RT18-32X 1P φ(10.3×38) 32A | 3 | 件 | FU1-3 |
| 51 | WGJ-DQ-CPDY-0229 | HRUO 上海沪工 | 熔芯 | RT18-32 φ(10.3×38) 6A | 3 | 件 | FU1-3 |
| 52 | WGJ-DQ-CPDY-0420 | L&N 兰诺 | 散热风扇 | SJ1238HA2B 120mm×120mm 220-240AC | 1 | 只 | FN1 |
| 53 | WGJ-DQ-CPDY-0421 | - | 散热风扇金属网罩 | 120mm×120mm | 1 | 只 | FN1 |
| 54 | WGJ-DQ-CPDY-0422 | - | 百叶窗风扇过滤网罩 | 120mm×120mm | 1 | 只 | FN1 |
| 55 | WGJ-DQ-CPDY-0423 | L&N 兰诺 | 散热风扇 | SJ9025HA2B 90mm×90mm 220-240AC | 1 | 只 | FN2 |
| 56 | WGJ-DQ-CPDY-0424 | - | 散热风扇金属网罩 | 90mm×90mm | 1 | 只 | FN2 |
| 57 | WGJ-DQ-CPDY-0425 | - | 百叶窗风扇过滤网罩 | 90mm×90mm | 1 | 只 | FN2 |
| 58 | WGJ-DQ-CPDY-0450 | XFY 新丰瀛 | LED天花射灯 | 7W 220V/50Hz | 1 | 套 | HL14 |
| 59 | WGJ-DQ-CPDY-0451 | FSL 佛山照明 | LED T5支架 | YT5-LED4 4W | 1 | 套 | HL0 |
| 60 | WGJ-DQ-CPDY-0452 | PEOPLE 人民电器 | 多功能插座 | AC30-W 250V/15A | 1 | 只 | 23X |
| 61 | WGJ-DQ-CPPJ-0000 | CHNG | 加厚卡轨 | 100CM×35MM×1MM 钢导轨 | 4 | 条 | - |
| 62 | WGJ-DQ-CPPJ-0001 | MKT 美控特 | PVC阻燃开口绝缘配线槽 | 50mm×50mm×200CM | 8 | 米 | - |
| 63 | WGJ-DQ-CPPJ-0050 | 南京菲尼克斯 | 直通式接线端子 | TB 6 I(深灰色) 3000486 | 4 | 件 | - |
| 64 | WGJ-DQ-CPPJ-0051 | 南京菲尼克斯 | 直通式接线端子 | TB 2.5 BI(深灰色) 3059773 | 200 | 件 | - |
| 65 | WGJ-DQ-CPPJ-0052 | 南京菲尼克斯 | 接地端子 | TB 6-PE I(黄绿相间) 3059870 | 2 | 件 | - |
| 66 | WGJ-DQ-CPPJ-0053 | 南京菲尼克斯 | 接地端子 | TB 2.5 B-PE I(黄绿相间) 3059854 | 20 | 件 | - |
| 67 | WGJ-DQ-CPPJ-0054 | 南京菲尼克斯 | 链式桥接件 | SCBI 10-6 W 3000834 | 1 | 包 | - |
| 68 | WGJ-DQ-CPPJ-0055 | 南京菲尼克斯 | 盖 | D-TB 2.5(深灰色) 3059919 | 30 | 件 | - |
| 69 | WGJ-DQ-CPPJ-0056 | 南京菲尼克斯 | 终端固定件 | E/UK(深灰色) 3059773 | 4 | 件 | - |
| 70 | WGJ-DQ-CPPJ-0100 | - | 管型预绝缘接线端子 | E4010（4.0mm2 L10mm）(灰色) | 5 | 只 | - |
| 71 | WGJ-DQ-CPPJ-0101 | - | 管型预绝缘接线端子 | E1510（1.5mm2 L 10mm）(红色) | 150 | 只 | - |
| 72 | WGJ-DQ-CPPJ-0102 | - | 管型预绝缘接线端子 | E1010（1.0mm2 L10mm）(黄色) | 400 | 只 | - |
| 73 | WGJ-DQ-CPPJ-0103 | 凤凰 | 冷压接线端子叉形预绝缘端头 | SV4-6（4-6mm2）(黑色) | 8 | 只 | - |
| 74 | WGJ-DQ-CPPJ-0104 | 凤凰 | 冷压接线端子叉形预绝缘端头 | SV1.25-3.7（0.5-1.5mm2）(红色) | 150 | 只 | - |
| 75 | WGJ-DQ-CPPJ-0150 | - | 快插接头 | zpc8-12×1.25 | 1 | 只 | - |
| 76 | WGJ-DQ-CPPJ-0151 | - | 金属接头 | 英制1又1/4” φ32 | 4 | 只 | - |
| 77 | WGJ-DQ-CPPJ-0152 | - | 公制M系列防水接头尼龙格兰头 | M40×1.5(白色) | 1 | 只 | - |、由于生成 Excel 表格失败，以下为文本形式输出的修正后文档：

### 错误清单
| 错误类型 | 具体位置 | 错误描述 | 修正建议 |
|----------|----------|----------|----------|
| 错字 | 序号 12 | 型号中“O.75KW”的“O”应为数字“0” | 修正为“0.75KW” |
| 逻辑错误 | 序号 27 | 数量 26 只，备注 KA1 - 7、9 - 11、16 - 18、23 - 30（共 21 只） | 修正数量为 21 或补充备注至 36 只 |
| 逻辑错误 | 序号 28 | 数量 10 只，备注 KA8、12 - 15、19 - 22（共 9 只） | 修正数量为 9 或补充备注至 10 只 |
| 格式错误 | 序号 82 | 描述“20×0.5mm2（4 芯）”矛盾 | 删除“（4 芯）”或修正为“20 芯” |
| 格式错误 | 序号 85 | “0 .5”中间空格 | 修正为“0.5” |
| 逻辑错误 | 序号 114 | 重复条目“2M5×35” | 修正为“201 不锈钢六角头螺栓 M5×35” |
| 格式错误 | 序号 111 - 140 | 机械螺丝条目 ERP 识别码缺失 | 补充 ERP 识别码（如“WGJ - DQ - JX - XXX”） |
| 格式错误 | 序号 147 - 163 | 全空行冗余内容 | 删除空行 |
| 格式错误 | 序号 49 | 重复条目“触点基座 ZB2BZ101C” | 删除重复行或修正型号 |

### 修正后文档（表格形式）
| 序号 | ERP 识别码 | 品牌 | 名称 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|-----------|------|------|----------|------|------|------|
| 1 | WGJ - DQ - CPCZ - 0000 | SIEMENS | HMI 面板 | 型号:SMART 1000 IE V4 订货号:6AV6 648 - 0DE11 - 3AX0 | 1 | 台 | CMP |
| 2 | WGJ - DQ - CPCZ - 0010 | SIEMENS | SMART 标准型 CPU 模块 | 型号:CPU ST60 订货号:6ES7 288 - 1ST60 - 0AA1 | 1 | 台 | PLC |
| 3 | WGJ - DQ - CPCZ - 0020 | SIEMENS | SMART 模拟量输入模块 | 型号:EM AE04 4 输入 订货号:6ES7 288 - 3AE04 - 0AA0 | 1 | 件 | AE04 |
| 4 | WGJ - DQ - CPCZ - 0050 | SIEMENS | 连接器 | 6ES7972 - 0BB42 - 0XA0 | 1 | 只 | RS485 |
| 5 | WGJ - DQ - CPCZ - 0051 | SIEMENS | PROFIBUS 通信电缆线 | 6XV1 - 830 - 0EH10 | 4 | 米 | - |
| 6 | WGJ - DQ - CPDX - 0100 | - | 网线 | 纯铜超 5 类屏蔽网线 8 芯 | 25 | 米 | - |
| 7 | WGJ - DQ - CPDX - 0101 | - | 网线水晶头 | 8 芯超五类屏蔽 | 6 | 只 | - |
| 8 | WGJ - DQ - CPCZ - 0210 | - | 交换机 | 工业五口百兆交换机 | 1 | 只 | - |
| 9 | WGJ - DQ - CPCZ - 0200 | 捷创 | PLC 远程网关 | JC00 - DE 4G Wifi | 1 | 台 | - |
| 10 | WGJ - DQ - CPCZ - 0107 | VLT 丹佛斯 | 变频器 | iC2 - 30FA3N04 - 12A0E20F4 + ACBC 380V 5.5KW | 1 | 台 | B5 |
| 11 | WGJ - DQ - CPCZ - 0104 | VLT 丹佛斯 | 变频器 | IC2 - 30FA3N04 - 05A3E20F4 + ACBC 380V 2.2KW | 2 | 台 | B1 - 2 |
| 12 | WGJ - DQ - CPCZ - 0102 | VLT 丹佛斯 | 变频器 | IC2 - 30FA3N04 - 02A2E20F4 + ACBC 380V 0.75KW | 2 | 台 | B3 - 4 |
| 13 | WGJ - DQ - CPCZ - 0070 | BRAHMA | 燃烧控制器 | 型号:SM592N/S 230VAC | 4 | 只 | CO1 - 4 |
| 14 | WGJ - DQ - CPDY - 0300 | Schneider 施耐德 | 工业开关电源 | ABL2REM24085K 24V 8.3A | 1 | 件 | WM |
| 15 | WGJ - DQ - CPDY - 0260 | Raytek 雷泰 | 红外测温器 | RAYCI3A 12 - 24VDC | 1 | 件 | HG |
| 16 | WGJ - DQ - CPDY - 0250 | STATELY 奥普士 | 接近开关 | SD - 1805F1 PNP NO 10 - 30VDC | 2 | 只 | JK1 |
| 17 | WGJ - DQ - CPDY - 0033 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C32 | 2 | 只 | QF1 |
| 18 | WGJ - DQ - CPDY - 0030 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C16 | 3 | 只 | QF2 - 5 |
| 19 | WGJ - DQ - CPDY - 0029 | Schneider 施耐德 | 小型断路器 | OSMC32 N3C10 | 1 | 只 | QF6 |
| 20 | WGJ - DQ - CPDY - 0005 | Schneider 施耐德 | 小型断路器 | OSMC32 N1C6 | 1 | 只 | QF8 |
| 21 | WGJ - DQ - CPDY - 0111 | Schneider 施耐德 | 交流接触器 | LC1 D1810 M7C 220VAC | 3 | 只 | KM1 - 2,6 |
| 22 | WGJ - DQ - CPDY - 0109 | Schneider 施耐德 | 交流接触器 | LC1 D0910 M7C 220VAC | 1 | 只 | KM3 - 5 |
| 23 | WGJ - DQ - CPDY - 0137 | Schneider 施耐德 | 热过载继电器 | LRD 07C 1.6 - 2.5A | 1 | 只 | FR3 |
| 24 | WGJ - DQ - CPDY - 0142 | Schneider 施耐德 | 热过载继电器 | LRD 16C 9 - 13A | 3 | 只 | FR1 - 2,6 |
| 25 | WGJ - DQ - CPCZ - 0052 | - | 直流信号隔离器 | 4 - 20mA 转 0 - 10V | 1 | 只 | - |
| 26 | WGJ - DQ - CPCZ - 0053 | - | 直流信号隔离器 | 0 - 10V 转 4 - 20mA | 1 | 只 | - |
| 27 | WGJ - DQ - CPDY - 0218 | OMRON 欧姆龙 | 中间小型继电器 | MY4N - GS 24VDC 4 组触点 | 21 | 只 | KA1 - 7,9 - 11,16 - 18,23 - 30 |
| 28 | WGJ - DQ - CPDY - 0221 | OMRON 欧姆龙 | 中间小型继电器 | MY4N - GS 220/240VAC | 9 | 只 | KA8,12 - 15,19 - 22 |
| 29 | WGJ - DQ - CPDY - 0223 | OMRON 欧姆龙 | 中间继电器底座 | PYFZ - 14 - E 14 脚 | 36 | 只 | KA1 - 36 |
| 30 | WGJ - DQ - CPDY - 0244 | Schneider 施耐德 | 3 极负荷开关 | V3C ITH63A | 1 | 只 | AK0 |
| 31 | WGJ - DQ - CPDY - 0237 | Schneider 施耐德 | 负荷开关操作手柄 | KCF2PZC (63A) | 1 | 只 | AK0 |
| 32 | WGJ - DQ - CPDY - 0350 | 德力西 | 电源隔离开关 | CDF1 - 20 16A 3P | 8 | 只 | AK1 - 5 |
| 33 | WGJ - DQ - CPDY - 0360 | SCHMERSAL 施迈赛 | 拉线开关 | TQ441 - 01/01y - UE - R - M20 - 1572 | 1 | 只 | SQ1 |
| 34 | WGJ - DQ - CPDY - 0380 | 浙江亿纬 | 耐高温行程开关 | JDHK - 2G 350℃ | 1 | 只 | SQ2 |
| 35 | WGJ - DQ - CPCZ - 0080 | - | 超声波液位计 | 1 米量程 DC24V 4 - 20mA + RS485 | 1 | 只 | - |
| 36 | WGJ - DQ - CPDY - 0400 | 新三色灯 | 报警灯管式安装底座 | 680.839.55 φ70mm 24VDC | 1 | 件 | BJ,FM |
| 37 | WGJ - DQ - CPDY - 0401 | - | 报警灯 LED 闪烁模块 | 682.139.55 φ70mm 24VDC | 1 | 件 | BJ,FM |
| 38 | WGJ - DQ - CPDY - 0402 | - | 报警灯蜂鸣器模块 | 685.829.55 φ70mm 24VDC 95dB | 1 | 件 | BJ,FM |
| 39 | WGJ - DQ - CPDY - 0403 | - | 直立式安装支架 | 975.849.11 | 1 | 件 | BJ,FM |
| 40 | WGJ - DQ - CPDY - 0164 | Schneider 施耐德 | 指示灯 | XB2BVB3LC（绿） | 1 | 只 | HL1,8 - 12 |
| 41 | WGJ - DQ - CPDY - 0181 | Schneider 施耐德 | 磨菇头按钮头 | ZB2BS54C（红） | 2 | 只 | SB9 - 10 |
| 42 | WGJ - DQ - CPDY - 0198 | Schneider 施耐德 | 触点基座 | ZB2BZ102C（常闭） | 1 | 只 | SB9 - 10 |
| 43 | WGJ - DQ - CPDY - 0249 | Schneider 施耐德 | 急停黄圈 | ZB2BY9330 | 1 | 只 | SB9 - 10 |
| 44 | WGJ - DQ - CPDY - 0189 | Schneider 施耐德 | 平头带灯按钮头 | ZB2BW33C(绿色 24V) | 1 | 只 | SB1 - 6(HL2 - 7) |
| 45 | WGJ - DQ - CPDY - 0202 | Schneider 施耐德 | 带灯按钮底座 | ZB2BWB31C(绿色 24V) | 1 | 只 | SB1 - 6(HL2 - 7) |
| 46 | WGJ - DQ - CPDY - 0187 | Schneider 施耐德 | 平头按钮头 | ZB2BA2C(黑色) | - | - | - |
| 47 | WGJ - DQ - CPDY - 0197 | Schneider 施耐德 | 触点基座 | ZB2BZ101C(常开) | 1 | 只 | SB1 - 6(HL2 - 7) |
| 48 | WGJ - DQ - CPDY - 0193 | Schneider 施耐德 | 标准手柄选择开关头 | ZB2BD2C（2 位） | 1 | 件 | SA1 - 2 |
| 49 | WGJ - DQ - CPDY - 0197 | Schneider 施耐德 | 触点基座 | ZB2BZ101C（常开） | 1 | 件 | SA1 - 2 |
| 50 | WGJ - DQ - CPDY - 0224 | HRUO 上海沪工 | 熔断器 | RT18 - 32X 1P φ(10.3×38) 32A | 3 | 件 | FU1 - 3 |
| 51 | WGJ - DQ - CPDY - 0229 | HRUO 上海沪工 | 熔芯 | RT18 - 32 φ(10.3×38) 6A | 3 | 件 | FU1 - 3 |
| 52 | WGJ - DQ - CPDY - 0420 | L&N 兰诺 | 散热风扇 | SJ1238HA2B 120mm×120mm 220 - 240AC | 1 | 只 | FN1 |
| 53 | WGJ - DQ - CPDY - 0421 | - | 散热风扇金属网罩 | 120mm×120mm | 1 | 只 | FN1 |
| 54 | WGJ - DQ - CPDY - 0422 | - | 百叶窗风扇过滤网罩 | 120mm×120mm | 1 | 只 | FN1 |
| 55 | WGJ - DQ - CPDY - 0423 | L&N 兰诺 | 散热风扇 | SJ9025HA2B 90mm×90mm 220 - 240AC | 1 | 只 | FN2 |
| 56 | WGJ - DQ - CPDY - 0424 | - | 散热风扇金属网罩 | 90mm×90mm | 1 | 只 | FN2 |
| 57 | WGJ - DQ - CPDY - 0425 | - | 百叶窗风扇过滤网罩 | 90mm×90mm | 1 | 只 | FN2 |
| 58 | WGJ - DQ - CPDY - 0450 | XFY 新丰瀛 | LED 天花射灯 | 7W 220V/50Hz | 1 | 套 | HL14 |
| 59 | WGJ - DQ - CPDY - 0451 | FSL 佛山照明 | LED T5 支架 | YT5 -、
