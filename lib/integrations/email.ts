import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private defaultFrom = process.env.EMAIL_FROM || 'Vibrant Tours <noreply@vibrantcitytours.com>';

  async send(options: EmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('Email Error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Send Email Error:', error);
      throw error;
    }
  }

  // Email de boas-vindas
  async sendWelcomeEmail(email: string, name: string) {
    return this.send({
      to: email,
      subject: 'Bem-vindo ao Vibrant City Tours!',
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Bem-vindo à equipe Vibrant City Tours.</p>
        <p>Acesse o dashboard em: <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
      `,
    });
  }

  // Email de confirmação de reserva
  async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      tourName: string;
      date: string;
      time: string;
      location: string;
      guideName?: string;
    }
  ) {
    return this.send({
      to: email,
      subject: `Confirmação de Reserva - ${bookingDetails.tourName}`,
      html: `
        <h1>Reserva Confirmada!</h1>
        <p>Sua reserva foi confirmada com sucesso.</p>
        <h2>Detalhes:</h2>
        <ul>
          <li><strong>Tour:</strong> ${bookingDetails.tourName}</li>
          <li><strong>Data:</strong> ${bookingDetails.date}</li>
          <li><strong>Horário:</strong> ${bookingDetails.time}</li>
          <li><strong>Local:</strong> ${bookingDetails.location}</li>
          ${bookingDetails.guideName ? `<li><strong>Guia:</strong> ${bookingDetails.guideName}</li>` : ''}
        </ul>
        <p>Nos vemos lá!</p>
      `,
    });
  }

  // Email de lembrete
  async sendReminder(
    email: string,
    reminderDetails: {
      tourName: string;
      date: string;
      time: string;
      location: string;
    }
  ) {
    return this.send({
      to: email,
      subject: `Lembrete: ${reminderDetails.tourName} amanhã`,
      html: `
        <h1>Lembrete de Tour</h1>
        <p>Seu tour está agendado para amanhã!</p>
        <h2>Detalhes:</h2>
        <ul>
          <li><strong>Tour:</strong> ${reminderDetails.tourName}</li>
          <li><strong>Data:</strong> ${reminderDetails.date}</li>
          <li><strong>Horário:</strong> ${reminderDetails.time}</li>
          <li><strong>Local:</strong> ${reminderDetails.location}</li>
        </ul>
        <p>Não se atrase!</p>
      `,
    });
  }

  // Email de cancelamento
  async sendCancellationEmail(
    email: string,
    cancellationDetails: {
      tourName: string;
      date: string;
      reason?: string;
    }
  ) {
    return this.send({
      to: email,
      subject: `Cancelamento: ${cancellationDetails.tourName}`,
      html: `
        <h1>Tour Cancelado</h1>
        <p>Lamentamos informar que seu tour foi cancelado.</p>
        <h2>Detalhes:</h2>
        <ul>
          <li><strong>Tour:</strong> ${cancellationDetails.tourName}</li>
          <li><strong>Data:</strong> ${cancellationDetails.date}</li>
          ${cancellationDetails.reason ? `<li><strong>Motivo:</strong> ${cancellationDetails.reason}</li>` : ''}
        </ul>
        <p>Entre em contato conosco para reagendar.</p>
      `,
    });
  }

  // Email de relatório semanal
  async sendWeeklyReport(
    email: string,
    reportData: {
      totalTours: number;
      totalRevenue: number;
      avgRating: number;
      topGuide: string;
    }
  ) {
    return this.send({
      to: email,
      subject: 'Relatório Semanal - Vibrant Tours',
      html: `
        <h1>Relatório Semanal</h1>
        <h2>Resumo da Semana:</h2>
        <ul>
          <li><strong>Total de Tours:</strong> ${reportData.totalTours}</li>
          <li><strong>Receita:</strong> €${reportData.totalRevenue.toFixed(2)}</li>
          <li><strong>Avaliação Média:</strong> ${reportData.avgRating.toFixed(1)}/5.0</li>
          <li><strong>Guia Destaque:</strong> ${reportData.topGuide}</li>
        </ul>
        <p>Continue o excelente trabalho!</p>
      `,
    });
  }

  // Email de reset de senha
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    return this.send({
      to: email,
      subject: 'Redefinir Senha - Vibrant Tours',
      html: `
        <h1>Redefinir Senha</h1>
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
