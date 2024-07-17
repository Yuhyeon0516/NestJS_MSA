import { CreateChargeDto } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(private readonly configService: ConfigService) {}

  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    { apiVersion: '2024-06-20' },
  );

  async createCharge({ card, amount }: CreateChargeDto) {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card,
    });

    const paymentIntentsCreateObject: Stripe.PaymentIntentCreateParams =
      this.configService.get('NODE_ENV') === 'development'
        ? {
            // payment_method: paymentMethod.id,
            amount: amount * 100,
            confirm: true,
            // payment_method_types: ['card'],
            currency: 'usd',
            payment_method: 'pm_card_visa',
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never',
            },
          }
        : {
            payment_method: paymentMethod.id,
            amount: amount * 100,
            confirm: true,
            currency: 'usd',
          };

    const paymentIntent = await this.stripe.paymentIntents.create(
      paymentIntentsCreateObject,
    );

    return paymentIntent;
  }
}
