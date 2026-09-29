import { ApiProperty } from '@nestjs/swagger';

export class RoleSummaryDto {
    @ApiProperty({
        description: 'Role id.',
        format: 'uuid',
        example: '3f2b8c1e-6d4a-4b7e-9a1c-2d5e8f7a9b10',
    })
    id: string;

    @ApiProperty({ description: 'Role name.', example: 'ADMIN' })
    name: string;
}

export class AuthenticatedUserDto {
    @ApiProperty({
        description: 'User id.',
        format: 'uuid',
        example: '8c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
    })
    id: string;

    @ApiProperty({ example: 'admin@torino.com', format: 'email' })
    email: string;

    @ApiProperty({ example: 'Admin' })
    firstName: string;

    @ApiProperty({ type: String, nullable: true, example: 'User' })
    lastName: string | null;

    @ApiProperty({ type: () => RoleSummaryDto })
    role: RoleSummaryDto;

    @ApiProperty({
        description: 'Permission codes granted through the user role.',
        type: [String],
        example: ['orders.read', 'orders.update_status', 'products.read'],
    })
    permissions: string[];
}