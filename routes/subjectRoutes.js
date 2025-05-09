import express from 'express'
import { adminAuth, isAuthenticated } from '../middleware/Authenticate.js'
import {
  createSubject,
  deleteSubjectById,
  getAllSubjects,
  getSubjectById,
  updateSubjectById,
} from '../controllers/document/subject/subjectController.js'

const router = express.Router()

router.post('/create', isAuthenticated, adminAuth, createSubject)
router.get('/', isAuthenticated, isAuthenticated, getAllSubjects)
router.get('/:id', isAuthenticated, isAuthenticated, getSubjectById)
router.put('/:id', isAuthenticated, adminAuth, updateSubjectById)
router.delete('/:id', isAuthenticated, adminAuth, deleteSubjectById)

export default router
