import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { z } from 'zod';
import { orchestrate } from '../services/agentOrchestrator';

const SendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(2000),
  userId: z.string().optional(),
});

const chatRoutes: FastifyPluginAsync = async (app) => {
  // Start or continue a chat session
  app.post('/', async (req, reply) => {
    const { sessionId, message, userId } = SendMessageSchema.parse(req.body);

    // Get or create session
    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: userId ?? null,
          messages: [],
        },
      });
    }

    const history = session.messages as Array<{ role: string; content: string }>;

    // Run orchestration
    const result = await orchestrate({
      sessionId: session.id,
      userMessage: message,
      history,
      userId: userId ?? session.userId ?? undefined,
    });

    // Append user + assistant messages to history
    const updatedMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: result.response, agent: result.agent },
    ];

    // Update session
    const updatedSession = await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        messages: updatedMessages,
        outcome: result.outcome ?? session.outcome,
        userId: result.userId ?? session.userId,
      },
    });

    return {
      sessionId: updatedSession.id,
      response: result.response,
      agent: result.agent,
      outcome: updatedSession.outcome,
    };
  });

  // Get session history
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!session) return reply.status(404).send({ error: 'Session not found' });
    return session;
  });
};

export default chatRoutes;
