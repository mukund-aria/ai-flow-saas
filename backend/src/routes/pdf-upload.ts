/**
 * PDF Upload Route
 *
 * POST /api/pdf/upload - Upload a PDF, detect fillable fields
 */

import { Router } from 'express';
import multer from 'multer';
import { savePDFAndDetectFields } from '../services/pdf.js';

const router = Router();

// Multer config: memory storage, 20MB limit, PDF only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  },
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No PDF file provided' },
      });
      return;
    }

    const result = await savePDFAndDetectFields(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[PDF Upload] Error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: err.message || 'Failed to process PDF' },
    });
  }
});

export default router;
