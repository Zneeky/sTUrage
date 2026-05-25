import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KpiCard from '../../components/KpiCard.vue';

const stubs = { QIcon: true };

describe('KpiCard', () => {
  it('renders the value and label', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Total Products', value: 42, icon: 'inventory', color: 'primary' },
      global: { stubs },
    });
    expect(wrapper.find('.kpi-value').text()).toBe('42');
    expect(wrapper.find('.kpi-label').text()).toBe('Total Products');
  });

  it('renders subtitle when provided', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Label', value: 0, icon: 'icon', color: 'info', subtitle: 'low stock' },
      global: { stubs },
    });
    expect(wrapper.find('.kpi-subtitle').text()).toBe('low stock');
  });

  it('does not render the subtitle element when subtitle is omitted', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Label', value: 0, icon: 'icon', color: 'info' },
      global: { stubs },
    });
    expect(wrapper.find('.kpi-subtitle').exists()).toBe(false);
  });
});
