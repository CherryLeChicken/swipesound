import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest } from '@swipesound/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordRequest): Promise<{ message: string; debugToken?: string }> {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordRequest): Promise<{ success: true }> {
    return this.authService.resetPassword(data);
  }
}

