import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface UserInfo {
  id: number
  openid: string
  nickname: string | null
  avatarUrl: string | null
  detectionCount: number
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    const userId = Taro.getStorageSync('userId')
    if (!userId) {
      return
    }

    try {
      const res = await Network.request({
        url: `/api/user/${userId}`,
        method: 'GET'
      })

      if (res.data.code === 200) {
        setUserInfo(res.data.data)
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      // 获取登录 code
      const loginRes = await Taro.login()
      console.log('登录 code:', loginRes.code)

      // 获取用户信息（新版授权方式）
      let userProfile: { nickName: string; avatarUrl: string } | null = null
      try {
        const profileRes = await Taro.getUserProfile({
          desc: '用于完善用户资料'
        })
        userProfile = {
          nickName: profileRes.userInfo.nickName,
          avatarUrl: profileRes.userInfo.avatarUrl
        }
        console.log('用户信息:', userProfile)
      } catch (err) {
        console.log('用户取消授权或获取信息失败')
      }

      // 调用后端登录接口
      const res = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: userProfile
        }
      })

      if (res.data.code === 200) {
        // 保存用户信息
        Taro.setStorageSync('userId', res.data.data.id)
        Taro.setStorageSync('userInfo', res.data.data)
        setUserInfo(res.data.data)

        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: res.data.msg || '登录失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('登录失败:', err)
      Taro.showToast({
        title: '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('userId')
          Taro.removeStorageSync('userInfo')
          setUserInfo(null)
          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-rose-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6 block">我的</Text>

      {userInfo ? (
        <>
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <View className="flex items-center">
              <View className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                {userInfo.avatarUrl ? (
                  <Image
                    src={userInfo.avatarUrl}
                    mode="aspectFill"
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-2xl">👩</Text>
                )}
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800 block">
                  {userInfo.nickname || '用户'}
                </Text>
                <Text className="text-sm text-gray-500 block">
                  开始您的皮肤检测之旅
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-base text-gray-800 block">检测次数</Text>
              <Text className="text-2xl font-bold text-rose-400 block">
                {userInfo.detectionCount} 次
              </Text>
            </View>
            <View className="p-4">
              <Text className="text-base text-gray-800 block">会员等级</Text>
              <Text className="text-sm text-gray-500 block">
                {userInfo.detectionCount >= 10 ? '高级会员' : '普通会员'}
              </Text>
            </View>
          </View>

          <View className="mt-6">
            <Button
              onClick={handleLogout}
              className="bg-white text-gray-600 rounded-xl shadow-sm"
            >
              退出登录
            </Button>
          </View>
        </>
      ) : (
        <View className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <View className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800 mb-2 block">未登录</Text>
          <Text className="text-sm text-gray-500 mb-6 block">登录后可查看检测记录和个性化推荐</Text>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="bg-rose-400 text-white rounded-xl w-full"
          >
            {loading ? '登录中...' : '微信授权登录'}
          </Button>
        </View>
      )}
    </View>
  )
}
