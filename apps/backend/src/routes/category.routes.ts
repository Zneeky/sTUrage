import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.put('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.delete('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

export default router;
