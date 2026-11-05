import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/entities/order.entity';

export interface EmailDispatchResult {
  sent: boolean;
  messageId?: string;
  previewUrl?: string | null;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Transporter SMTP configurado com host: ${host}`);
      return this.transporter;
    }

    // Cria automaticamente conta Ethereal SMTP gratuita para visualização real do e-mail em desenvolvimento
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(
        `Conta SMTP Ethereal criada automaticamente (${testAccount.user}) para envio e preview real de e-mails!`,
      );
      return this.transporter;
    } catch (err) {
      this.logger.warn(
        'Modo offline/fallback de e-mail ativado (sem conexão externa com Ethereal).',
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return this.transporter;
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  }

  async sendOrderConfirmation(order: Order): Promise<EmailDispatchResult> {
    try {
      const transporter = await this.getTransporter();

      const itemsHtml = order.items
        .map((item) => {
          const bookingBadge = item.bookingDetails
            ? `<div style="margin-top: 6px; padding: 6px 10px; background: #eef2ff; border-left: 3px solid #4f46e5; border-radius: 4px; font-size: 12px; color: #312e81;">
                <strong>📅 Reserva / Check-in:</strong> ${item.bookingDetails.checkInDate} às ${item.bookingDetails.checkInTime}
                (${item.bookingDetails.guests} ${item.bookingDetails.guests > 1 ? 'pessoas' : 'pessoa'})
                ${item.bookingDetails.notes ? `<br/><em>Obs: ${item.bookingDetails.notes}</em>` : ''}
               </div>`
            : '';

          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: 600; color: #111827;">${item.productName}</div>
                <div style="font-size: 12px; color: #6b7280;">Tipo: ${item.productType === 'BOOKING' ? 'Agendamento / Experiência' : 'Produto Físico'}</div>
                ${bookingBadge}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
                ${item.quantity}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">
                ${this.formatCurrency(Number(item.unitPrice))}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">
                ${this.formatCurrency(Number(item.subtotal))}
              </td>
            </tr>
          `;
        })
        .join('');

      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px;">Pedido Confirmado! 🎉</h1>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">
              Olá, <strong>${order.customerName}</strong>! Recebemos seu pedido <strong>#${order.orderNumber}</strong>.
            </p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #f9fafb; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #374151;">
              <div><strong>Código do Pedido:</strong> #${order.orderNumber}</div>
              <div><strong>Forma de Pagamento:</strong> ${order.paymentMethod}</div>
              ${order.shippingAddress ? `<div><strong>Endereço de Entrega:</strong> ${order.shippingAddress}</div>` : ''}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f3f4f6; text-align: left; color: #4b5563;">
                  <th style="padding: 10px 12px;">Item</th>
                  <th style="padding: 10px 12px; text-align: center;">Qtd</th>
                  <th style="padding: 10px 12px; text-align: right;">Unitário</th>
                  <th style="padding: 10px 12px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right; font-size: 18px; color: #111827;">
              <strong>Valor Total: ${this.formatCurrency(Number(order.totalAmount))}</strong>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            NovaStore E-commerce & Booking • Obrigado por comprar conosco!
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"NovaStore E-commerce" <no-reply@novastore.dev>',
        to: order.customerEmail,
        subject: `✅ Confirmação do Pedido #${order.orderNumber} - NovaStore`,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      if (previewUrl) {
        this.logger.log(
          `📧 E-mail de confirmação enviado! Visualize em: ${previewUrl}`,
        );
      } else {
        this.logger.log(
          `📧 E-mail de confirmação registrado para ${order.customerEmail} (MessageId: ${info.messageId})`,
        );
      }

      return {
        sent: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de confirmação:', error);
      return {
        sent: false,
        previewUrl: null,
      };
    }
  }
}

