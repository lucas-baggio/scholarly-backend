import { User } from '../../../../modules/users/domain/user.entity';

describe('User Entity', () => {
  it('deve instanciar um usuário corretamente', () => {
    const user = new User({
      id: '1',
      name: 'Fabio',
      email: 'fabio@teste.com',
      password: '12345678',
      isActive: true,
      subjects: ['math'],
    });

    expect(user.name).toBe('Fabio');
    expect(user.isActive).toBe(true);
  });

  it('deve desativar um usuário', () => {
    const user = new User({
      id: '1',
      name: 'Fabio',
      email: 'fabio@teste.com',
      password: '12345678',
      isActive: true,
    });

    user.deactive();
    expect(user.isActive).toBe(false);
  });
});
