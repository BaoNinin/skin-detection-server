#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NFC 标签写入工具
用于将网页 URL 写入 NFC 标签，实现网页跳转微信小程序
"""

import sys
import time

def check_dependencies():
    """检查必要的依赖库"""
    print("检查依赖库...")
    try:
        import nfcpy
        print("✅ nfcpy 已安装")
    except ImportError:
        print("❌ nfcpy 未安装")
        print("\n请安装依赖库：")
        print("  pip install nfcpy")
        print("\n或使用以下命令安装：")
        print("  sudo apt-get install python3-nfcpy  # Linux")
        return False
    return True

def write_nfc_tag(url):
    """
    写入 NFC 标签

    Args:
        url (str): 要写入的网页 URL
    """
    import nfc

    print(f"\n{'='*60}")
    print("  NFC 标签写入工具")
    print(f"{'='*60}")
    print(f"\n准备写入的 URL：{url}")
    print("\n请将 NFC 标签靠近读取器...\n")

    try:
        # 等待 NFC 标签
        clf = nfc.ContactlessFrontend()

        # 定义写入函数
        def on_connect(tag):
            print(f"✅ 检测到 NFC 标签")
            print(f"   类型：{tag.type}")
            print(f"   ID：{tag.identifier.hex()}")

            try:
                # 创建 NDEF 记录
                from nfc.ndef import UriRecord
                record = UriRecord(url)

                # 写入数据
                print(f"\n正在写入数据...")
                tag.ndef.records = [record]

                print(f"\n{'='*60}")
                print("  ✅ 写入成功！")
                print(f"{'='*60}")
                print(f"\n写入的内容：{url}")
                print(f"\n你可以用手机碰一碰这个标签进行测试！")
                return True

            except Exception as e:
                print(f"\n❌ 写入失败：{str(e)}")
                print("\n可能的原因：")
                print("  - NFC 标签可能已加密或受保护")
                print("  - 标签存储空间不足")
                print("  - 标签格式不兼容")
                return False

        # 连接标签并写入
        while True:
            try:
                clf.sense(remote_target={'106A'}, on_connect=on_connect)
                # 写入成功后等待 2 秒，然后退出
                time.sleep(2)
                break
            except KeyboardInterrupt:
                print("\n\n用户取消操作")
                break
            except Exception as e:
                print(f"\n⚠️  错误：{str(e)}")
                print("请重试...\n")
                time.sleep(1)

    except Exception as e:
        print(f"\n❌ 初始化失败：{str(e)}")
        print("\n请确保：")
        print("  1. NFC 读取器已连接")
        print("  2. 已安装必要的驱动程序")
        print("  3. 在 Linux 上运行时，检查设备权限：")
        print("     ls -l /dev/bus/usb/")

def write_with_ndeflib(url):
    """
    使用 ndeflib 库写入 NFC 标签（备选方案）

    Args:
        url (str): 要写入的网页 URL
    """
    print("\n尝试使用 ndeflib 库写入...")

    try:
        from ndef import UriRecord, Message
        import platform

        # 创建 NDEF 消息
        record = UriRecord(url)
        message = Message([record])

        print(f"\nNDEF 数据已生成")
        print(f"数据：{message.to_byte_array().hex()}")

        # 提示用户使用 NFC 工具 App 写入
        print(f"\n请使用 NFC 工具 App（如 NFC Tools）写入以下数据：")
        print(f"\n类型：URI Record")
        print(f"内容：{url}")
        print(f"\nNDEF 数据：")
        print(f"{message.to_byte_array().hex()}")

        # 根据不同平台提供建议
        if platform.system() == 'Android':
            print(f"\n在 Android 手机上：")
            print(f"1. 下载 NFC Tools App")
            print(f"2. 选择 '写入' → '添加记录' → 'URI'")
            print(f"3. 输入 URL：{url}")
            print(f"4. 靠近 NFC 标签写入")
        else:
            print(f"\n在电脑上：")
            print(f"1. 使用 ACR122U 等 NFC 读写器")
            print(f"2. 使用配套软件写入 NDEF 数据")
            print(f"3. 或使用 NFC 手机写入")

        return True

    except ImportError:
        print("❌ ndeflib 未安装")
        print("\n请安装：pip install ndef")
        return False
    except Exception as e:
        print(f"❌ 生成 NDEF 数据失败：{str(e)}")
        return False

def main():
    """主函数"""
    print("\n🎯 NFC 标签写入工具")
    print("="*60)

    # 获取 URL 参数
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        print("\n请输入要写入的网页 URL：")
        url = input("> ").strip()

    # 验证 URL
    if not url:
        print("\n❌ 错误：URL 不能为空")
        return

    if not url.startswith('http://') and not url.startswith('https://'):
        print("\n❌ 错误：URL 必须以 http:// 或 https:// 开头")
        return

    # 检查依赖
    if not check_dependencies():
        print("\n尝试使用备选方案...")
        write_with_ndeflib(url)
        return

    # 写入 NFC 标签
    write_nfc_tag(url)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 再见！")
    except Exception as e:
        print(f"\n❌ 程序出错：{str(e)}")
