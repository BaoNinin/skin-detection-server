import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../storage/database/supabase-client'
import { WechatLoginDto, UserInfoDto, UpdateUserInfoDto } from './user.types'

@Injectable()
export class UserService {
  async login(wechatLoginDto: WechatLoginDto): Promise<{ userInfo: UserInfoDto; isNewUser: boolean }> {
    const { code, userInfo } = wechatLoginDto

    const client = getSupabaseClient()

    // TODO: 调用微信接口，使用 code 换取 openid
    // 暂时使用 code 作为 openid（实际需要调用微信 API）
    const openid = `openid_${code}`

    // 查询用户是否已存在
    const { data: existingUsers, error: queryError } = await client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1)

    if (queryError) {
      console.error('查询用户失败:', queryError)
      throw queryError
    }

    let userId: number
    let isNewUser = false

    if (existingUsers && existingUsers.length > 0) {
      // 用户已存在，更新用户信息
      userId = existingUsers[0].id
      const { error: updateError } = await client
        .from('users')
        .update({
          nickname: userInfo?.nickName || existingUsers[0].nickname,
          avatar_url: userInfo?.avatarUrl || existingUsers[0].avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('更新用户失败:', updateError)
        throw updateError
      }
    } else {
      // 新用户，创建用户
      const { data: newUsers, error: insertError } = await client
        .from('users')
        .insert({
          openid,
          nickname: userInfo?.nickName || null,
          avatar_url: userInfo?.avatarUrl || null,
          detection_count: 0
        })
        .select()

      if (insertError) {
        console.error('创建用户失败:', insertError)
        throw insertError
      }

      userId = newUsers[0].id
      isNewUser = true
    }

    // 获取用户信息
    const { data: users, error: fetchError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)

    if (fetchError || !users || users.length === 0) {
      throw new Error('获取用户信息失败')
    }

    return {
      userInfo: this.toUserInfoDto(users[0]),
      isNewUser
    }
  }

  async getUserById(userId: number): Promise<UserInfoDto> {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)

    if (error || !data || data.length === 0) {
      throw new Error('用户不存在')
    }

    return this.toUserInfoDto(data[0])
  }

  async getUserByOpenid(openid: string): Promise<UserInfoDto> {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1)

    if (error || !data || data.length === 0) {
      throw new Error('用户不存在')
    }

    return this.toUserInfoDto(data[0])
  }

  async updateUserInfo(userId: number, updateDto: UpdateUserInfoDto): Promise<UserInfoDto> {
    const client = getSupabaseClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (updateDto.nickname !== undefined) {
      updateData.nickname = updateDto.nickname
    }
    if (updateDto.avatarUrl !== undefined) {
      updateData.avatar_url = updateDto.avatarUrl
    }

    const { error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }

    const { data, error: fetchError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)

    if (fetchError || !data || data.length === 0) {
      throw new Error('获取更新后的用户信息失败')
    }

    return this.toUserInfoDto(data[0])
  }

  async incrementDetectionCount(userId: number): Promise<UserInfoDto> {
    const client = getSupabaseClient()

    // 先获取当前用户信息
    const { data: users, error: queryError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)

    if (queryError || !users || users.length === 0) {
      throw new Error('用户不存在')
    }

    // 更新检测次数
    const { error: updateError } = await client
      .from('users')
      .update({
        detection_count: users[0].detection_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('更新检测次数失败:', updateError)
      throw updateError
    }

    // 获取更新后的用户信息
    const { data: updatedUsers, error: fetchError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)

    if (fetchError || !updatedUsers || updatedUsers.length === 0) {
      throw new Error('获取更新后的用户信息失败')
    }

    return this.toUserInfoDto(updatedUsers[0])
  }

  private toUserInfoDto(user: any): UserInfoDto {
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      detectionCount: user.detection_count,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  }
}
