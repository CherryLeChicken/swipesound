import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, UpdateGenresRequest, Genre } from '@swipesound/shared-types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { User } from '../user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('genres')
  getGenres(): Genre[] {
    return this.authService.getGenres();
  }

  @Post('register')
  async register(@Body() data: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(data);
  }

  @Post('update-genres')
  @UseGuards(JwtAuthGuard)
  async updateGenres(
    @GetUser() user: User,
    @Body() data: UpdateGenresRequest,
  ): Promise<{ success: true }> {
    return this.authService.updateGenres(user.id, data);
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

