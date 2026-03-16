import { View, Text, Button, Image, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface UserInfo {
  id: number
  openid: string | null
  phoneNumber: string | null
  nickname: string | null
  avatarUrl: string | null
  detectionCount: number
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [tempAvatarUrl, setTempAvatarUrl] = useState('')
  const [tempNickname, setTempNickname] = useState('')

  useDidShow(() => {
    loadUserInfo()
    autoLoginIfNot()
  })

  useEffect(() => {
    loadUserInfo()
    autoLoginIfNot()
  }, [])

  const autoLoginIfNot = async () => {
    const userId = Taro.getStorageSync('userId')
    const storedUserInfo = Taro.getStorageSync('userInfo')
    
    // 如果已有 userId 和 userInfo，不需要自动登录
    if (userId && storedUserInfo) {
      console.log('用户已登录，跳过自动登录')
      return
    }
    
    // 如果没有 userId，尝试静默自动登录
    if (!userId) {
      console.log('用户未登录，尝试自动登录')
      try {
        const loginRes = await Taro.login()
        console.log('自动登录 code:', loginRes.code)

        const res = await Network.request({
          url: '/api/user/login',
          method: 'POST',
          data: {
            code: loginRes.code,
            userInfo: null
          }
        })

        if (res.data.code === 200) {
          const userData = res.data.data
          Taro.setStorageSync('userId', userData.id)
          Taro.setStorageSync('userInfo', userData)
          setUserInfo(userData)
          console.log('自动登录成功，userId:', userData.id)
        } else {
          console.error('自动登录失败:', res.data.msg)
        }
      } catch (err) {
        console.error('自动登录失败:', err)
      }
    }
  }

  const loadUserInfo = async () => {
    const userId = Taro.getStorageSync('userId')
    if (!userId) {
      setUserInfo(null)
      return
    }

    try {
      const res = await Network.request({
        url: `/api/user/${userId}`,
        method: 'GET'
      })

      if (res.data.code === 200) {
        setUserInfo(res.data.data)
        Taro.setStorageSync('userInfo', res.data.data)
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      const loginRes = await Taro.login()
      console.log('登录 code:', loginRes.code)

      const res = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: null
        }
      })

      if (res.data.code === 200) {
        const userData = res.data.data
        Taro.setStorageSync('userId', userData.id)
        Taro.setStorageSync('userInfo', userData)
        setUserInfo(userData)

        // 登录成功后，检查是否需要完善信息
        if (!userData.nickname || !userData.avatarUrl) {
          // 显示完善信息弹窗
          setShowEditProfile(true)
          setTempNickname(userData.nickname || '')
          setTempAvatarUrl(userData.avatarUrl || '')
        } else {
          Taro.showToast({
            title: '登录成功',
            icon: 'success'
          })
        }
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

  const handleChooseAvatar = (e: any) => {
    console.log('选择微信头像:', e.detail.avatarUrl)
    if (e.detail.avatarUrl) {
      setTempAvatarUrl(e.detail.avatarUrl)
    }
  }

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        console.log('选择相册图片:', res.tempFilePaths[0])
        setTempAvatarUrl(res.tempFilePaths[0])
      }
    })
  }

  const handleSaveProfile = async () => {
    if (!tempNickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    try {
      const userId = Taro.getStorageSync('userId')
      const res = await Network.request({
        url: `/api/user/${userId}`,
        method: 'PUT',
        data: {
          nickname: tempNickname.trim(),
          avatarUrl: tempAvatarUrl || null
        }
      })

      if (res.data.code === 200) {
        setUserInfo(res.data.data)
        Taro.setStorageSync('userInfo', res.data.data)
        setShowEditProfile(false)
        Taro.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: res.data.msg || '保存失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('保存失败:', err)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }

  const handleEditProfile = () => {
    if (userInfo) {
      setTempNickname(userInfo.nickname || '')
      setTempAvatarUrl(userInfo.avatarUrl || '')
      setShowEditProfile(true)
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

      {/* 完善信息弹窗 */}
      {showEditProfile && (
        <View className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-80 mx-4">
            <Text className="text-xl font-semibold text-gray-800 mb-6 block text-center">完善个人信息</Text>

            <View className="flex flex-col items-center mb-6">
              <View className="relative">
                {tempAvatarUrl ? (
                  <Image
                    src={tempAvatarUrl}
                    mode="aspectFill"
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Text className="text-4xl">👤</Text>
                  </View>
                )}
              </View>

              <View className="flex gap-2 mt-4">
                <Button
                  openType="chooseAvatar"
                  onChooseAvatar={handleChooseAvatar}
                  size="mini"
                  className="flex-1 bg-rose-400 text-white rounded-full border-0"
                >
                  微信头像
                </Button>
                <Button
                  onClick={handleChooseImage}
                  size="mini"
                  className="flex-1 bg-white text-rose-400 border-2 border-rose-400 rounded-full"
                >
                  相册选择
                </Button>
              </View>
            </View>

            <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-gray-500 block mb-2">昵称</Text>
              <Input
                type="nickname"
                value={tempNickname}
                onInput={(e) => setTempNickname(e.detail.value)}
                placeholder="请输入您的昵称"
                className="w-full bg-transparent"
                maxlength={20}
              />
            </View>

            <View className="flex gap-3">
              <Button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 bg-gray-200 text-gray-700 rounded-xl"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-rose-400 text-white rounded-xl"
              >
                保存
              </Button>
            </View>
          </View>
        </View>
      )}

      {userInfo ? (
        <>
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <View className="flex items-center justify-between">
              <View
                className="flex items-center cursor-pointer active:opacity-70"
                onClick={handleEditProfile}
              >
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
                  <View className="flex items-center">
                    <Text className="text-lg font-semibold text-gray-800 block">
                      {userInfo.nickname || '用户'}
                    </Text>
                    <Text className="text-gray-400 text-sm ml-2">✎</Text>
                  </View>
                  {userInfo.phoneNumber && (
                    <Text className="text-sm text-gray-500 block">
                      📱 {userInfo.phoneNumber}
                    </Text>
                  )}
                  {!userInfo.phoneNumber && (
                    <Text className="text-sm text-gray-500 block">
                      开始您的皮肤检测之旅
                    </Text>
                  )}
                </View>
              </View>
              <Button
                size="mini"
                onClick={handleEditProfile}
                className="bg-rose-400 text-white rounded-full"
              >
                编辑
              </Button>
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
                {userInfo.detectionCount >= 50 ? '高级会员' : '普通会员'}
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

          {loading ? (
            <View className="flex items-center justify-center py-3">
              <Text className="text-base text-gray-600 block">登录中...</Text>
            </View>
          ) : (
            <Button
              onClick={handleLogin}
              className="bg-rose-400 text-white rounded-xl w-full"
            >
              微信快速登录
            </Button>
          )}
        </View>
      )}
    </View>
  )
}
