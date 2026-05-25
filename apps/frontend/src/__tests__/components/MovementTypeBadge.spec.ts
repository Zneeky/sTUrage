import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MovementTypeBadge from '../../components/MovementTypeBadge.vue';

const cases = [
  { type: 'INBOUND',    cls: 'badge-soft--green' },
  { type: 'OUTBOUND',   cls: 'badge-soft--red'   },
  { type: 'TRANSFER',   cls: 'badge-soft--blue'  },
  { type: 'ADJUSTMENT', cls: 'badge-soft--amber' },
] as const;

describe('MovementTypeBadge', () => {
  cases.forEach(({ type, cls }) => {
    it(`renders ${type} with class ${cls}`, () => {
      const wrapper = mount(MovementTypeBadge, { props: { type } });
      expect(wrapper.classes()).toContain('badge-soft');
      expect(wrapper.classes()).toContain(cls);
      expect(wrapper.text()).toBe(type);
    });
  });
});
