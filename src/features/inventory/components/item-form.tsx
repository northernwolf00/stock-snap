import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useAddItem } from '../hooks/use-inventory';

type ItemFormValues = {
  sku: string;
  name: string;
  description: string;
  quantity: string;
  min_quantity: string;
  barcode: string;
};

type Props = {
  initialBarcode?: string;
  onSuccess?: () => void;
};

export function ItemForm({ initialBarcode = '', onSuccess }: Props) {
  const { mutate: addItem, isPending } = useAddItem();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemFormValues>({
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      quantity: '0',
      min_quantity: '0',
      barcode: initialBarcode,
    },
  });

  const onSubmit = (values: ItemFormValues) => {
    addItem(
      {
        sku: values.sku,
        name: values.name,
        description: values.description || undefined,
        quantity: parseInt(values.quantity, 10),
        min_quantity: parseInt(values.min_quantity, 10),
        barcode: values.barcode || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="sku"
        rules={{ required: 'SKU is required' }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="SKU *"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.sku}
              autoCapitalize="characters"
            />
            <HelperText type="error" visible={!!errors.sku}>
              {errors.sku?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Item Name *"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.mb}
          />
        )}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="quantity"
            rules={{ required: true, pattern: /^\d+$/ }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Qty *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="number-pad"
                error={!!errors.quantity}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="min_quantity"
            rules={{ required: true, pattern: /^\d+$/ }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Min Qty *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="number-pad"
                error={!!errors.min_quantity}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="barcode"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Barcode"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.mb}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        disabled={isPending}
        style={styles.submit}>
        Add Item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  mb: { marginBottom: 4 },
  submit: { marginTop: 12 },
});
