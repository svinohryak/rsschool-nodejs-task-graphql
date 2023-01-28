import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    try {
      return fastify.db.posts.findMany();
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
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (post) {
        return post;
      } else {
        throw fastify.httpErrors.notFound('post not found');
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        return fastify.db.posts.create(request.body);
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
    async function (request, reply): Promise<PostEntity> {
      try {
        return fastify.db.posts.delete(request.params.id);
      } catch (error) {
        throw fastify.httpErrors.badRequest(`${error}`);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        return fastify.db.posts.change(request.params.id, request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest(`${error}`);
      }
    }
  );
};

export default plugin;
