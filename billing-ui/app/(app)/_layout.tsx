import { Slot } from 'expo-router';
import Shell from '../../src/layout/shell';

export default function AppLayout() {
  return (
    <Shell>
      <Slot />
    </Shell>
  );
}