import { Router } from 'express'
import type { Request, Response } from 'express'
import type { UserService } from '../../../application/user/user.service'

export function buildUserRouter(service: UserService) {
  const router = Router()

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const users = await service.list()
      res.json(users)
    } catch (error) {
      res.status(500).json({ message: 'Falha ao listar usuarios.' })
    }
  })

  router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Id invalido.' })
      return
    }

    try {
      const user = await service.getById(id)
      if (!user) {
        res.status(404).json({ message: 'Usuario nao encontrado.' })
        return
      }

      res.json(user)
    } catch (error) {
      res.status(500).json({ message: 'Falha ao buscar usuario.' })
    }
  })

  router.post('/', async (req: Request, res: Response) => {
    const { name, email } = req.body ?? {}
    if (!name || !email) {
      res.status(400).json({ message: 'Nome e email sao obrigatorios.' })
      return
    }

    try {
      const user = await service.create({ name, email })
      res.status(201).json(user)
    } catch (error) {
      res.status(500).json({ message: 'Falha ao criar usuario.' })
    }
  })

  router.put('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Id invalido.' })
      return
    }

    const { name, email } = req.body ?? {}
    if (!name && !email) {
      res.status(400).json({ message: 'Informe nome ou email para atualizar.' })
      return
    }

    try {
      const user = await service.update(id, { name, email })
      if (!user) {
        res.status(404).json({ message: 'Usuario nao encontrado.' })
        return
      }

      res.json(user)
    } catch (error) {
      res.status(500).json({ message: 'Falha ao atualizar usuario.' })
    }
  })

  router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Id invalido.' })
      return
    }

    try {
      const removed = await service.remove(id)
      if (!removed) {
        res.status(404).json({ message: 'Usuario nao encontrado.' })
        return
      }

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Falha ao remover usuario.' })
    }
  })

  return router
}
