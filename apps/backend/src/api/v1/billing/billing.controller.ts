import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser, CurrentUserData, Public } from 'src/common/decorators';
import { Request } from 'express';
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

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') stripeSignature?: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody, stripeSignature);
  }
}

