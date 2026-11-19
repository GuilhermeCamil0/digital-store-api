module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API Digital Store - Geração Tech',
    version: '1.0.0',
    description: 'API REST para gerenciamento de usuários, categorias e produtos.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/v1/user/token': {
      post: {
        tags: ['Auth'],
        summary: 'Gerar token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@mail.com' },
                  password: { type: 'string', example: '123@123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Token gerado' }, 400: { description: 'Dados inválidos' } },
      },
    },
    '/v1/user': {
      post: {
        tags: ['Users'],
        summary: 'Cadastrar usuário',
        responses: { 201: { description: 'Usuário criado' }, 400: { description: 'Erro nos dados' } },
      },
    },
    '/v1/user/{id}': {
      get: { tags: ['Users'], summary: 'Buscar usuário por ID', responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } } },
      put: { tags: ['Users'], summary: 'Atualizar usuário', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Atualizado' } } },
      delete: { tags: ['Users'], summary: 'Deletar usuário', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Deletado' } } },
    },
    '/v1/category/search': {
      get: { tags: ['Categories'], summary: 'Listar categorias com filtros', responses: { 200: { description: 'OK' } } },
    },
    '/v1/category': {
      post: { tags: ['Categories'], summary: 'Criar categoria', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Criado' } } },
    },
    '/v1/category/{id}': {
      get: { tags: ['Categories'], summary: 'Buscar categoria por ID', responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } } },
      put: { tags: ['Categories'], summary: 'Atualizar categoria', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Atualizado' } } },
      delete: { tags: ['Categories'], summary: 'Deletar categoria', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Deletado' } } },
    },
    '/v1/product/search': {
      get: { tags: ['Products'], summary: 'Listar produtos com filtros', responses: { 200: { description: 'OK' } } },
    },
    '/v1/product': {
      post: { tags: ['Products'], summary: 'Criar produto', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Criado' } } },
    },
    '/v1/product/{id}': {
      get: { tags: ['Products'], summary: 'Buscar produto por ID', responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } } },
      put: { tags: ['Products'], summary: 'Atualizar produto', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Atualizado' } } },
      delete: { tags: ['Products'], summary: 'Deletar produto', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Deletado' } } },
    },
  },
};