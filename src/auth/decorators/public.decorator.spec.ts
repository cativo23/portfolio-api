import { SetMetadata } from '@nestjs/common';
import { Public } from './public.decorator';

vi.mock('@nestjs/common', () => ({
  SetMetadata: vi.fn(),
}));

describe('Public Decorator', () => {
  it('should call SetMetadata with correct parameters', () => {
    // Call the decorator
    Public();

    // Verify that SetMetadata was called with the correct parameters
    expect(SetMetadata).toHaveBeenCalledWith('isPublic', true);
  });
});
