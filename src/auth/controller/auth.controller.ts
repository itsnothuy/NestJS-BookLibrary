import { Body, Controller, Get, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { UsersService } from '../../users/service/users.service';


@Controller('auth')
export class AuthController {
    constructor(
        private auth: AuthService,
        private users: UsersService
    ) {}

    @Post('signup') signup(@Body() b: any) { return this.auth.signup(b.email, b.password, b.role); }
    @Post('login')  login(@Body() b: any)  { return this.auth.login(b.email, b.password); }

    @UseGuards(JwtAuthGuard)
    @Get('me') 
    async me(@Req() req: any) { 
        return this.users.findOne(req.user.uuid);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(@Req() req: any, @Body() body: any) { 
        return this.auth.updateProfile(req.user.uuid, body); 
    }
}
 