const request = require('supertest');
const app = require('../src/app');

describe('Testes da API Digital Store', () => {
  it('Deve retornar 200 na rota raiz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('Deve retornar 401 ao tentar criar categoria sem token JWT', async () => {
    const res = await request(app)
      .post('/v1/category')
      .send({ name: 'Shoes', slug: 'shoes', use_in_menu: true });
    expect(res.statusCode).toBe(401);
  });

  it('Deve retornar 401 ao tentar atualizar usuário sem token JWT', async () => {
    const res = await request(app)
      .put('/v1/user/1')
      .send({ firstname: 'Teste', surname: 'User', email: 'teste@mail.com' });
    expect(res.statusCode).toBe(401);
  });

  it('Deve retornar 401 ao tentar deletar produto sem token JWT', async () => {
    const res = await request(app).delete('/v1/product/1');
    expect(res.statusCode).toBe(401);
  });
});