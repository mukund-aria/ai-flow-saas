/**
 * PDF Service
 *
 * Handles PDF upload, field detection using pdf-lib.
 * Saves PDFs to disk and extracts fillable form field metadata.
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'pdfs');

export interface DetectedField {
  fieldId: string;
  pdfFieldName: string;
  label: string;
  fieldType: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature';
  required: boolean;
  options?: string[];
}

export interface PDFUploadResult {
  documentUrl: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  fields: DetectedField[];
}

/**
 * Convert PDF field names like "client_name" or "ClientName" to "Client Name"
 */
function humanizeFieldName(name: string): string {
  // Replace underscores/hyphens with spaces
  let result = name.replace(/[_-]/g, ' ');
  // Insert space before uppercase letters in camelCase/PascalCase
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Insert space before sequences of uppercase followed by lowercase (e.g., "PDFField" -> "PDF Field")
  result = result.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  // Capitalize first letter of each word
  result = result.replace(/\b\w/g, (c) => c.toUpperCase());
  return result.trim();
}

/**
 * Save a PDF buffer to disk and detect its fillable form fields.
 */
export async function savePDFAndDetectFields(
  buffer: Buffer,
  originalName: string,
): Promise<PDFUploadResult> {
  // Ensure uploads directory exists
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  // Save file with unique name
  const ext = path.extname(originalName) || '.pdf';
  const savedName = `${uuid()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, savedName);
  await fs.writeFile(filePath, buffer);

  // Load PDF and detect fields
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  const fields: DetectedField[] = [];
  try {
    const form = pdfDoc.getForm();
    const pdfFields = form.getFields();

    for (const field of pdfFields) {
      const name = field.getName();
      const constructor = field.constructor.name;

      let fieldType: DetectedField['fieldType'] = 'text';
      let options: string[] | undefined;

      if (constructor === 'PDFCheckBox') {
        fieldType = 'checkbox';
      } else if (constructor === 'PDFDropdown') {
        fieldType = 'dropdown';
        try {
          options = (field as any).getOptions?.() || [];
        } catch {
          options = [];
        }
      } else if (constructor === 'PDFRadioGroup') {
        fieldType = 'radio';
        try {
          options = (field as any).getOptions?.() || [];
        } catch {
          options = [];
        }
      } else if (constructor === 'PDFSignature') {
        fieldType = 'signature';
      }

      fields.push({
        fieldId: `pdf-field-${fields.length}`,
        pdfFieldName: name,
        label: humanizeFieldName(name),
        fieldType,
        required: false,
        ...(options && options.length > 0 ? { options } : {}),
      });
    }
  } catch {
    // PDF has no form - that's okay, return empty fields
  }

  // Build document URL (relative path served by static middleware)
  const documentUrl = `/uploads/pdfs/${savedName}`;

  return {
    documentUrl,
    fileName: originalName,
    fileSize: buffer.length,
    pageCount,
    fields,
  };
}
