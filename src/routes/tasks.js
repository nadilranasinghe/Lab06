const express = require('express');
const Task = require('../models/Task');
const redis = require('../config/redis');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const taskRules = [
  body('title')
    .isString().withMessage('title must be text')
    .bail()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('title must be 3-120 characters'),
  body('completed').optional().isBoolean().toBoolean(),
  body('priority').optional().isInt({ min: 1, max: 3 }).toInt(),
  validate
];

const updateTaskRules = [
  body('title')
    .optional()
    .isString().withMessage('title must be text')
    .bail()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('title must be 3-120 characters'),
  body('completed').optional().isBoolean().toBoolean(),
  body('priority').optional().isInt({ min: 1, max: 3 }).toInt(),
  validate
];


router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'task-api' });
});

router.get('/', async (req, res, next) => {
  try {
    const cached = await redis.get('tasks:all');

    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    const tasks = await Task.findAll({
      order: [['createdAt', 'DESC']]
    });

    await redis.setEx('tasks:all', 60, JSON.stringify(tasks));

    res.json({
      source: 'database',
      data: tasks
    });
  } catch (err) {
    next(err);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.post('/', taskRules, async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    await redis.del('tasks:all');
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', updateTaskRules, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.update(req.body);
    await redis.del('tasks:all');
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
    await redis.del('tasks:all');
  } catch (err) {
    next(err);
  }
});

module.exports = router;