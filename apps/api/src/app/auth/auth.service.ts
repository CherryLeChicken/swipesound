import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { User } from '../user.entity';
import { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, UpdateGenresRequest, Genre } from '@swipesound/shared-types';

@Injectable()
export class AuthService {
  private resend: Resend | null = null;
  private readonly SUPPORTED_GENRES: Genre[] = [
    { id: 132, name: 'Pop', picture: 'https://e-cdns-images.dzcdn.net/images/misc/ed6ccf0f4a864d4a856636733ec5a109/250x250-000000-80-0-0.jpg' },
    { id: 116, name: 'Rap/Hip Hop', picture: 'https://e-cdns-images.dzcdn.net/images/misc/7892b109e3ec0f88a9194ec71f985e50/250x250-000000-80-0-0.jpg' },
    { id: 152, name: 'Rock', picture: 'https://e-cdns-images.dzcdn.net/images/misc/06d64939a311100f28e10036f0a3b836/250x250-000000-80-0-0.jpg' },
    { id: 113, name: 'Dance', picture: 'https://e-cdns-images.dzcdn.net/images/misc/67e8156108f972000049445100650000/250x250-000000-80-0-0.jpg' },
    { id: 129, name: 'Jazz', picture: 'https://e-cdns-images.dzcdn.net/images/misc/803d153e4142f36f6d0a79354009ec8e/250x250-000000-80-0-0.jpg' },
    { id: 106, name: 'Electro', picture: 'https://e-cdns-images.dzcdn.net/images/misc/655f4a7c000000000000000000000000/250x250-000000-80-0-0.jpg' },
    { id: 165, name: 'R&B', picture: 'https://e-cdns-images.dzcdn.net/images/misc/d8544d6731d100000000000000000000/250x250-000000-80-0-0.jpg' },
    { id: 85, name: 'Alternative', picture: 'https://e-cdns-images.dzcdn.net/images/misc/714f331031d100000000000000000000/250x250-000000-80-0-0.jpg' },
  ];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  getGenres(): Genre[] {
    return this.SUPPORTED_GENRES;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existing = await this.userRepository.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      email: data.email,
      passwordHash,
    });

    await this.userRepository.save(user);

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        preferredGenres: user.preferredGenres,
      },
      accessToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        preferredGenres: user.preferredGenres,
      },
      accessToken,
    };
  }

  async updateGenres(userId: number, data: UpdateGenresRequest): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferredGenres = data.genreIds;
    await this.userRepository.save(user);
    return { success: true };
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; debugToken?: string }> {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    // Send actual email using Resend
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'SwipeSound <onboarding@resend.dev>',
          to: user.email,
          subject: 'Reset your SwipeSound Password',
          html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset for your SwipeSound account.</p>
            <p>Please use the following token to reset your password:</p>
            <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: bold; margin: 20px 0;">
              ${token}
            </div>
            <p>This token will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      } catch (e) {
        console.error('Failed to send email:', e);
      }
    }

    return { 
      message: 'Password reset instructions sent to email',
      debugToken: this.resend ? undefined : token 
    };
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ 
      where: { resetToken: data.token } 
    });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    user.passwordHash = await bcrypt.hash(data.password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepository.save(user);

    return { success: true };
  }

  async validateUser(payload: any): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.sub } });
  }
}
