import { NOTIFICATIONS_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    { apiVersion: '2024-06-20' },
  );

  async createCharge({ card, amount, email }: PaymentsCreateChargeDto) {
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

    this.notificationsService.emit('notify_email', { email });

    return paymentIntent;
  }
}
