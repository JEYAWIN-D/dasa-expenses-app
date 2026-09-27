import { prisma } from '../config/prisma.js';

const DEFAULT_CONFIGS = {
  QUOTATION: { prefix: 'QT', includeFiscalYear: true, padLength: 4 },
  INVOICE: { prefix: 'INV', includeFiscalYear: true, padLength: 4 },
  PAYMENT: { prefix: 'REC', includeFiscalYear: true, padLength: 4 },
  EXPENSE: { prefix: 'EXP', includeFiscalYear: true, padLength: 4 },
  CLIENT: { prefix: 'CLI', includeFiscalYear: false, padLength: 4 },
  VENDOR: { prefix: 'VEN', includeFiscalYear: false, padLength: 4 },
  PROJECT: { prefix: 'PRJ', includeFiscalYear: true, padLength: 4 },
};

/**
 * Atomically generates the next sequence number for a document type
 * Safe for concurrent requests using Prisma transactional atomic increment
 * @param {string} documentType - QUOTATION, INVOICE, PAYMENT, EXPENSE, CLIENT, VENDOR
 * @param {Object} [tx] - Optional existing Prisma transaction
 * @returns {Promise<string>} e.g. QT-2026-0001
 */
export async function generateNextDocumentNumber(documentType, tx = null) {
  const db = tx || prisma;

  // Execute within transaction to guarantee uniqueness
  const generate = async (prismaTx) => {
    // 1. Fetch or create the config
    let config = await prismaTx.numberingConfig.findUnique({
      where: { documentType },
    });

    if (!config) {
      const defaults = DEFAULT_CONFIGS[documentType] || {
        prefix: documentType.substring(0, 3).toUpperCase(),
        includeFiscalYear: true,
        padLength: 4,
      };

      config = await prismaTx.numberingConfig.create({
        data: {
          documentType,
          prefix: defaults.prefix,
          includeFiscalYear: defaults.includeFiscalYear,
          currentSequence: 1,
          padLength: defaults.padLength,
        },
      });
    }

    const currentSeq = config.currentSequence;

    // 2. Increment sequence atomically for next caller
    await prismaTx.numberingConfig.update({
      where: { id: config.id },
      data: {
        currentSequence: {
          increment: 1,
        },
      },
    });

    // 3. Format the document number
    const padded = String(currentSeq).padStart(config.padLength, '0');
    const currentYear = new Date().getFullYear();

    if (config.includeFiscalYear) {
      return `${config.prefix}-${currentYear}-${padded}`;
    }

    return `${config.prefix}-${padded}`;
  };

  if (tx) {
    return await generate(tx);
  } else {
    return await prisma.$transaction(async (prismaTx) => {
      return await generate(prismaTx);
    });
  }
}
