import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  async initiateKonnect(order: { orderId: string; amount: number; description: string }) {
    try {
      const response = await axios.post(
        'https://api.preprod.konnect.network/api/v2/payments/init-payment',
        {
          receiverWalletId: process.env.KONNECT_WALLET_ID,
          token: 'TND',
          amount: Math.round(order.amount * 1000),
          type: 'immediate',
          description: order.description,
          acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
          lifespan: 10,
          checkoutForm: true,
          addPaymentFeesToAmount: true,
          firstName: 'Client',
          lastName: 'OPTIMARK',
          orderId: order.orderId,
          webhook: `${process.env.FRONTEND_URL}/api/payments/konnect/webhook`,
          successUrl: `${process.env.FRONTEND_URL}/commandes?payment=success`,
          failUrl: `${process.env.FRONTEND_URL}/commandes?payment=failed`,
        },
        {
          headers: {
            'x-api-key': process.env.KONNECT_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      return { data: response.data, message: 'Paiement Konnect initié', success: true };
    } catch (error: any) {
      throw new InternalServerErrorException(error?.response?.data || 'Erreur Konnect');
    }
  }

  async initiatePaymee(order: { orderId: string; amount: number; description: string }) {
    try {
      const response = await axios.post(
        'https://sandbox.paymee.tn/api/v1/payments/create',
        {
          vendor: process.env.PAYMEE_VENDOR_TOKEN,
          amount: order.amount,
          note: order.description,
          first_name: 'Client',
          last_name: 'OPTIMARK',
          email: 'client@optimark.tn',
          phone: '00000000',
          return_url: `${process.env.FRONTEND_URL}/commandes?payment=success`,
          cancel_url: `${process.env.FRONTEND_URL}/commandes?payment=failed`,
          webhook_url: `${process.env.FRONTEND_URL}/api/payments/paymee/webhook`,
          order_id: order.orderId,
        },
        {
          headers: {
            Authorization: `Token ${process.env.PAYMEE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return { data: response.data, message: 'Paiement Paymee initié', success: true };
    } catch (error: any) {
      throw new InternalServerErrorException(error?.response?.data || 'Erreur Paymee');
    }
  }

  async verifyPayment(paymentId: string, provider: 'konnect' | 'paymee') {
    try {
      let response;
      if (provider === 'konnect') {
        response = await axios.get(
          `https://api.preprod.konnect.network/api/v2/payments/${paymentId}`,
          { headers: { 'x-api-key': process.env.KONNECT_API_KEY } },
        );
      } else {
        response = await axios.get(
          `https://sandbox.paymee.tn/api/v1/payments/${paymentId}/check`,
          { headers: { Authorization: `Token ${process.env.PAYMEE_API_KEY}` } },
        );
      }
      return { data: response.data, message: 'Paiement vérifié', success: true };
    } catch (error: any) {
      throw new InternalServerErrorException(error?.response?.data || 'Erreur de vérification');
    }
  }
}
