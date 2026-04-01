import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { WechatLoginDto, PhoneNumberLoginDto, UserInfoDto, UpdateUserInfoDto } from './user.types'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() wechatLoginDto: WechatLoginDto) {
    const result = await this.userService.login(wechatLoginDto)
    return {
      code: 200,
      msg: result.isNewUser ? '登录成功，欢迎新用户' : '登录成功',
      data: result.userInfo
    }
  }

  @Post('login/phone')
  async loginWithPhone(@Body() phoneNumberLoginDto: PhoneNumberLoginDto) {
    const result = await this.userService.loginWithPhoneNumber(phoneNumberLoginDto)
    return {
      code: 200,
      msg: result.isNewUser ? '登录成功，欢迎新用户' : '登录成功',
      data: result.userInfo
    }
  }

  @Get(':userId')
  async getUserInfo(@Param('userId') userId: string) {
    const userInfo = await this.userService.getUserById(parseInt(userId))
    return {
      code: 200,
      msg: '获取成功',
      data: userInfo
    }
  }

  @Put(':userId')
  async updateUserInfo(@Param('userId') userId: string, @Body() updateDto: UpdateUserInfoDto) {
    const userInfo = await this.userService.updateUserInfo(parseInt(userId), updateDto)
    return {
      code: 200,
      msg: '更新成功',
      data: userInfo
    }
  }

  @Post(':userId/increment-detection')
  async incrementDetectionCount(@Param('userId') userId: string) {
    const userInfo = await this.userService.incrementDetectionCount(parseInt(userId))
    return {
      code: 200,
      msg: '检测次数更新成功',
      data: userInfo
    }
  }
}
