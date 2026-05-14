import { stub, mockId } from '@/lib/stubs';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * EmailService stub. Substitua por integração real (ex: Resend) preenchendo
 * os métodos abaixo e instalando a SDK. Veja docs/CUSTOMIZATION.md.
 */
export class EmailService {
  private defaultFrom =
    process.env.EMAIL_FROM ?? 'TourPilot <noreply@example.com>';

  async send(options: EmailOptions) {
    return stub('email.send', { to: options.to, subject: options.subject }, {
      id: mockId('email'),
      from: options.from ?? this.defaultFrom,
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    return stub('email.welcome', { email, name }, { id: mockId('email') });
  }

  async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      tourName: string;
      date: string;
      time: string;
      location: string;
      guideName?: string;
    },
  ) {
    return stub('email.bookingConfirmation', { email, ...bookingDetails }, {
      id: mockId('email'),
    });
  }

  async sendReminder(
    email: string,
    reminderDetails: {
      tourName: string;
      date: string;
      time: string;
      location: string;
    },
  ) {
    return stub('email.reminder', { email, ...reminderDetails }, {
      id: mockId('email'),
    });
  }

  async sendCancellationEmail(
    email: string,
    cancellationDetails: { tourName: string; date: string; reason?: string },
  ) {
    return stub('email.cancellation', { email, ...cancellationDetails }, {
      id: mockId('email'),
    });
  }

  async sendWeeklyReport(
    email: string,
    reportData: {
      totalTours: number;
      totalRevenue: number;
      avgRating: number;
      topGuide: string;
    },
  ) {
    return stub('email.weeklyReport', { email, ...reportData }, {
      id: mockId('email'),
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    return stub('email.passwordReset', { email, resetToken }, {
      id: mockId('email'),
    });
  }
}

export const emailService = new EmailService();
