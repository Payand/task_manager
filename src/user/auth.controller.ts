import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { ApiDoc } from '../shared/decorators/api-doc.decorators';

import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiDoc({
    summary: 'Register a new user',
    operationId: 'registerUser',
    okSchema: RegisterResponseDto,
    description: 'Registers a new user and returns the user id and username.',
  })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.userService.create(body.username, body.password);
    return {username: user.username };
  }

  @ApiDoc({
    summary: 'Login with username and password',
    operationId: 'loginUser',
    okSchema: LoginResponseDto,
    description: 'Logs in a user and returns a JWT access token.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
