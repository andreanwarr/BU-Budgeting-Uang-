const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
  'trashmail.com', 'throwaway.email', 'maildrop.cc', 'temp-mail.org',
  'yopmail.com', 'fakeinbox.com', 'sharklasers.com', 'getnada.com'
];

const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function validateEmailFormat(email: string): EmailValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email tidak boleh kosong' };
  }

  email = email.trim().toLowerCase();

  if (!VALID_EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }

  const domain = email.split('@')[1];

  if (!domain || domain.length < 4) {
    return { isValid: false, error: 'Domain email tidak valid' };
  }

  if (!domain.includes('.')) {
    return { isValid: false, error: 'Domain email harus memiliki ekstensi (contoh: .com, .co.id)' };
  }

  const parts = domain.split('.');
  const tld = parts[parts.length - 1];

  if (tld.length < 2 || tld.length > 6) {
    return { isValid: false, error: 'Ekstensi domain tidak valid' };
  }

  if (/[^a-z0-9.-]/.test(domain)) {
    return { isValid: false, error: 'Domain mengandung karakter tidak valid' };
  }

  if (domain.startsWith('-') || domain.endsWith('-') || domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Format domain tidak valid' };
  }

  if (domain.includes('..')) {
    return { isValid: false, error: 'Format domain tidak valid' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.some(d => domain.includes(d))) {
    return { isValid: false, error: 'Email sementara tidak diperbolehkan' };
  }

  const commonTypos = checkCommonTypos(domain);
  if (commonTypos.length > 0) {
    return {
      isValid: true,
      warnings: commonTypos
    };
  }

  return { isValid: true };
}

function checkCommonTypos(domain: string): string[] {
  const warnings: string[] = [];

  const commonDomains: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  const suggestion = commonDomains[domain];
  if (suggestion) {
    warnings.push(`Apakah Anda maksud @${suggestion}?`);
  }

  return warnings;
}

export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  const formatCheck = validateEmailFormat(email);
  if (!formatCheck.isValid) {
    return formatCheck;
  }

  try {
    const domain = email.split('@')[1];

    const knownValidDomains = [
      'gmail.com', 'yahoo.com', 'yahoo.co.id', 'hotmail.com', 'outlook.com',
      'icloud.com', 'me.com', 'aol.com', 'protonmail.com', 'zoho.com',
      'mail.com', 'gmx.com', 'yandex.com'
    ];

    const commonIndonesianDomains = [
      '.co.id', '.ac.id', '.go.id', '.or.id', '.sch.id', '.web.id'
    ];

    const isKnownDomain = knownValidDomains.includes(domain);
    const isIndonesianDomain = commonIndonesianDomains.some(d => domain.endsWith(d));

    if (!isKnownDomain && !isIndonesianDomain && domain.split('.').length === 2) {
      const tld = domain.split('.')[1];
      const commonTLDs = ['com', 'net', 'org', 'edu', 'id', 'co', 'io'];

      if (!commonTLDs.includes(tld)) {
        return {
          isValid: false,
          error: 'Domain email tidak dikenali. Pastikan menggunakan email yang valid'
        };
      }
    }

    return { isValid: true, warnings: formatCheck.warnings };
  } catch (error) {
    return { isValid: true, warnings: formatCheck.warnings };
  }
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 6) {
    return { strength: 'weak', message: 'Password terlalu pendek' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { strength: 'weak', message: 'Password lemah' };
  } else if (score <= 3) {
    return { strength: 'medium', message: 'Password cukup kuat' };
  } else {
    return { strength: 'strong', message: 'Password kuat' };
  }
}
