import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user1', description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  access_token: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user1', description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: '1', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user1', description: 'Username' })
  username: string;
}
