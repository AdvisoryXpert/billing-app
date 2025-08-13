// src/components/StatusFilter.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button } from 'react-native-paper';

type Props = {
  value: string;
  onChange: (status: string) => void;
};

const statuses = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function StatusFilter({ value, onChange }: Props) {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setVisible(true)}>
            {value ? statuses.find(s => s.value === value)?.label : 'Status'}
          </Button>
        }
      >
        {statuses.map(s => (
          <Menu.Item
            key={s.value}
            onPress={() => {
              onChange(s.value);
              setVisible(false);
            }}
            title={s.label}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 10 }
});