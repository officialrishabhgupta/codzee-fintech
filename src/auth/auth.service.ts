import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { RegisterDto, LoginDto, UserResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserResponseDto; token: string }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserResponseDto; token: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.blockedUntil && user.blockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Please try again later.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      // Increment login attempts on failed password
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await this.userRepository.save(user);
        throw new UnauthorizedException('Too many failed login attempts. Account locked for 15 minutes.');
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.blockedUntil = null;

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
