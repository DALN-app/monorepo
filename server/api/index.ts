import express from 'express';

import upload_encrypted from './upload_encrypted';

const router = express.Router();

router.use('/upload_encrypted', upload_encrypted);

export default router;
