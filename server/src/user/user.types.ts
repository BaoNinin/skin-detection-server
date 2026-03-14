export interface WechatLoginDto {
  code: string
  userInfo?: {
    nickName: string
    avatarUrl: string
  }
}

export interface PhoneNumberLoginDto {
  code: string
  encryptedData: string
  iv: string
}

export interface UserInfoDto {
  id: number
  openid: string | null
  phoneNumber: string | null
  nickname: string | null
  avatarUrl: string | null
  detectionCount: number
  createdAt: string
  updatedAt: string
}

export interface UpdateUserInfoDto {
  nickname?: string
  avatarUrl?: string
  phoneNumber?: string
}
