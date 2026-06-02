import { User, ROLES } from './user.entity';

describe('User entity', () => {
  describe('assignDefaultRoles (@BeforeInsert)', () => {
    it('defaults roles to [USER] when none are provided', () => {
      const user = new User();
      user.assignDefaultRoles();
      expect(user.roles).toEqual([ROLES.USER]);
    });

    it('defaults roles to [USER] when an empty array is provided', () => {
      const user = new User();
      user.roles = [];
      user.assignDefaultRoles();
      expect(user.roles).toEqual([ROLES.USER]);
    });

    it('preserves explicitly provided roles', () => {
      const user = new User();
      user.roles = [ROLES.ADMIN];
      user.assignDefaultRoles();
      expect(user.roles).toEqual([ROLES.ADMIN]);
    });
  });
});
