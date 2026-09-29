import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        description:
            'JWT access token. Send it as `Authorization: Bearer <token>` on protected endpoints.',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZjJlLi4uIiwiZW1haWwiOiJhZG1pbkB0b3Jpbm8uY29tIn0.signature',
    })
    accessToken: string;
}