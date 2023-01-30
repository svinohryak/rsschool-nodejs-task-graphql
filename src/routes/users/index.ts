import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    try {
      return fastify.db.users.findMany();
    } catch (error) {
      throw fastify.httpErrors.badRequest(`${error}`);
    }
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (user) {
        return user;
      } else {
        throw fastify.httpErrors.notFound('user not found');
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.create(request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest(`${error}`);
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.delete(request.params.id);
      } catch (error) {
        throw fastify.httpErrors.badRequest(`${error}`);
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      const userToSubscribe = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (user) {
        if (userToSubscribe?.subscribedToUserIds.includes(request.params.id)) {
          return userToSubscribe;
        } else {
          throw fastify.httpErrors.notFound('subscriber not found');
        }
      } else {
        throw fastify.httpErrors.notFound('user not found');
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      const userToUnsubscribe = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (user) {
        if (userToUnsubscribe) {
          return fastify.db.users.change(userToUnsubscribe.id, {
            subscribedToUserIds: userToUnsubscribe.subscribedToUserIds,
          });
        } else {
          throw fastify.httpErrors.notFound('subscribed user not found');
        }
      } else {
        throw fastify.httpErrors.notFound('user not found');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.change(request.params.id, request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest(`${error}`);
      }
    }
  );
};

export default plugin;
