import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser, CurrentUserData } from 'src/common/decorators';
import { BillingService } from './billing.service';
import {
  CreateCheckoutSessionRequestDto,
  CreateCheckoutSessionResponseDto,
} from './dto';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('catalog')
  getCatalog() {
    return this.billingService.getCatalog();
  }

  @Post('checkout-session')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: CreateCheckoutSessionResponseDto })
  createCheckoutSession(
    @Body() payload: CreateCheckoutSessionRequestDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.billingService.createCheckoutSession(payload, user);
  }
}

