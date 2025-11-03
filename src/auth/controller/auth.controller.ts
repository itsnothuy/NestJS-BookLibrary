import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Post('signup') signup(@Body() b: any) { return this.auth.signup(b.email, b.password, b.role); }
    @Post('login')  login(@Body() b: any)  { return this.auth.login(b.email, b.password); }

    @UseGuards(JwtAuthGuard)
    @Get('me') 
    me(@Req() req: any) { return req.user; }

}
 