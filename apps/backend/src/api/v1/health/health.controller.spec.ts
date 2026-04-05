import { HealthController } from './health.controller';

describe('HealthController', () => {
  const sequelize = {
    authenticate: jest.fn(),
  };

  let controller: HealthController;

  beforeEach(() => {
    sequelize.authenticate.mockReset();
    controller = new HealthController(sequelize as never);
  });

  it('returns liveness state', () => {
    const response = controller.checkLiveness();

    expect(response.status).toBe('live');
    expect(response.timestamp).toEqual(expect.any(String));
    expect(response.uptime).toEqual(expect.any(Number));
  });

  it('returns readiness when database is reachable', async () => {
    sequelize.authenticate.mockResolvedValue(undefined);

    await expect(controller.checkReadiness()).resolves.toMatchObject({
      status: 'ready',
      database: 'connected',
    });
  });

  it('returns not_ready when database is unreachable', async () => {
    sequelize.authenticate.mockRejectedValue(new Error('db down'));

    await expect(controller.checkReadiness()).resolves.toMatchObject({
      status: 'not_ready',
      database: 'disconnected',
      error: 'db down',
    });
  });
});
